
import React, { useState, useEffect, useCallback, useContext } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { AuthContext } from '../contexts/AuthContext';
import { Customer, CustomerTransaction } from '../types';
import { EditIcon, TrashIcon } from '../constants';

const DailyBusinessPage: React.FC = () => {
    const { supabase } = useContext(AuthContext);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    const [isEditTxModalOpen, setIsEditTxModalOpen] = useState(false);
    
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<CustomerTransaction | null>(null);
    const [formState, setFormState] = useState<any>({});
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };
    
    const fetchData = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true });

        const { data: transactionsData, error: transactionsError } = await supabase
            .from('customer_transactions')
            .select('*');

        if (customersError || transactionsError) {
            console.error(customersError || transactionsError);
        } else if (customersData && transactionsData) {
            setTransactions(transactionsData);
            const customersWithTotals = customersData.map(customer => {
                const txs = transactionsData.filter(tx => tx.customer_id === customer.id);
                const totalGiven = txs.filter(t => t.type === 'Given').reduce((sum, t) => sum + t.amount, 0);
                const totalReceived = txs.filter(t => t.type === 'Received').reduce((sum, t) => sum + t.amount, 0);
                return { ...customer, totalGiven, totalReceived };
            });
            setCustomers(customersWithTotals);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        if (supabase) {
            fetchData();
        }
    }, [fetchData, supabase]);

    const handleOpenModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>, customer: Customer | null = null, initialFormState = {}) => {
        setSelectedCustomer(customer);
        setFormState(initialFormState);
        modalSetter(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        const { error } = await supabase.from('customers').insert([
            { name: formState.name, phone: formState.phone, address: formState.address, status: 'Active' }
        ]);
        if (error) console.error(error);
        else {
            setIsAddCustomerModalOpen(false);
            fetchData();
        }
    };
    
    const handleUpdateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer || !supabase) return;
        const { error } = await supabase.from('customers').update({
            name: formState.name,
            phone: formState.phone,
            address: formState.address,
            status: formState.status
        }).eq('id', selectedCustomer.id);
        
        if (error) console.error(error);
        else {
            setIsEditModalOpen(false);
            fetchData();
        }
    };
    
    const handleDeleteCustomer = async (customerId: number) => {
        if (!supabase) return;
        if (window.confirm('Are you sure you want to delete this customer and all their transactions? This action cannot be undone.')) {
            await supabase.from('customer_transactions').delete().eq('customer_id', customerId);
            const { error } = await supabase.from('customers').delete().eq('id', customerId);
            if (error) {
                console.error(error);
                showNotification(`Error deleting customer: ${error.message}`, 'error');
            } else {
                showNotification('Customer deleted successfully!', 'success');
                fetchData();
            }
        }
    };

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer || !supabase) return;
        const { error } = await supabase.from('customer_transactions').insert([{
            customer_id: selectedCustomer.id,
            date: formState.date,
            amount: parseFloat(formState.amount),
            description: formState.description,
            type: formState.type
        }]);

        if (error) console.error(error);
        else {
            setIsAddTxModalOpen(false);
            fetchData();
        }
    };

    const handleUpdateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransaction || !supabase) return;
        const { error } = await supabase.from('customer_transactions').update({
            date: formState.date,
            amount: parseFloat(formState.amount),
            description: formState.description,
            type: formState.type,
        }).eq('id', selectedTransaction.id);

        if (error) console.error(error);
        else {
            setIsEditTxModalOpen(false);
            fetchData();
        }
    };

    const handleDeleteTransaction = async (transactionId: number) => {
        if (!supabase) return;
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            const { error } = await supabase.from('customer_transactions').delete().eq('id', transactionId);
            if (error) {
                console.error(error);
                showNotification(`Error deleting transaction: ${error.message}`, 'error');
            } else {
                showNotification('Transaction deleted successfully!', 'success');
                setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
                fetchData();
            }
        }
    };
    
    const overview = customers.reduce((acc, curr) => {
        acc.totalGiven += curr.totalGiven;
        acc.totalReceived += curr.totalReceived;
        return acc;
    }, { totalGiven: 0, totalReceived: 0 });
    const balance = overview.totalGiven - overview.totalReceived;
    
    const tableHeaders = ['Customer Name', 'Total Given', 'Total Received', 'Balance', 'Status', 'Actions'];

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderCustomerRow = (customer: Customer) => (
        <tr key={customer.id} className="border-b border-border hover:bg-table-rowHover">
            <td className="p-4 font-medium text-textPrimary">
                {customer.name}
                <div className="md:hidden mt-2 space-x-2">
                    <button onClick={() => { setSelectedCustomer(customer); setIsViewModalOpen(true); }} className="text-primary hover:underline text-sm">View</button>
                    <button onClick={() => handleOpenModal(setIsAddTxModalOpen, customer, { date: new Date().toISOString().split('T')[0], type: 'Given' })} className="text-blue-600 hover:underline text-sm">Add Tx</button>
                    <button onClick={() => handleOpenModal(setIsEditModalOpen, customer, { ...customer })} className="p-1 text-warning rounded-full hover:bg-pill-warning-bg"><EditIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDeleteCustomer(customer.id)} className="p-1 text-danger rounded-full hover:bg-pill-danger-bg"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </td>
            <td className="p-4 text-success">₹{customer.totalGiven.toLocaleString()}</td>
            <td className="p-4 text-danger">₹{customer.totalReceived.toLocaleString()}</td>
            <td className={`p-4 font-semibold ${customer.totalGiven - customer.totalReceived >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{(customer.totalGiven - customer.totalReceived).toLocaleString()}
            </td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'Active' ? 'bg-pill-success-bg text-pill-success-text' : 'bg-pill-danger-bg text-pill-danger-text'}`}>
                    {customer.status}
                </span>
            </td>
            <td className="p-4 space-x-2 whitespace-nowrap hidden md:table-cell">
                <button onClick={() => { setSelectedCustomer(customer); setIsViewModalOpen(true); }} className="text-primary hover:underline">View</button>
                <button onClick={() => handleOpenModal(setIsAddTxModalOpen, customer, { date: new Date().toISOString().split('T')[0], type: 'Given' })} className="text-blue-600 hover:underline">Add Tx</button>
                <button onClick={() => handleOpenModal(setIsEditModalOpen, customer, { ...customer })} className="p-1 text-warning rounded-full hover:bg-pill-warning-bg"><EditIcon /></button>
                <button onClick={() => handleDeleteCustomer(customer.id)} className="p-1 text-danger rounded-full hover:bg-pill-danger-bg"><TrashIcon /></button>
            </td>
        </tr>
    );

    const formInputStyle = "w-full p-2 border border-border rounded-md bg-surface text-textPrimary focus:ring-primary focus:border-primary";

    const customerTransactions = selectedCustomer
        ? transactions
            .filter(tx => tx.customer_id === selectedCustomer.id)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [];
        
    if (!supabase) {
        return <div>Loading database connection...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-textPrimary">Daily Business</h1>
             {notification && (
                <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-pill-success-bg text-pill-success-text' : 'bg-pill-danger-bg text-pill-danger-text'}`}>
                {notification.message}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Given" value={`₹${overview.totalGiven.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>} color="bg-green-500" />
                <StatCard title="Total Received" value={`₹${overview.totalReceived.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="bg-red-500" />
                <StatCard title="Balance" value={`₹${balance.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M5.5 9.5L14.5 5M18 20v-5h-5m3.5 1.5L9.5 19" /></svg>} color="bg-blue-500" />
            </div>

            <div className="bg-surface p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-2xl font-semibold text-textPrimary">Customers</h2>
                    <div className="flex-grow max-w-md">
                         <input
                            type="text"
                            placeholder="Search customers..."
                            className="w-full p-2 border border-border rounded-md bg-surface text-textPrimary focus:ring-primary focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal(setIsAddCustomerModalOpen, null)} className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap">
                        + Add Customer
                    </button>
                </div>
            </div>
            
            {loading ? <p>Loading...</p> : <Table headers={tableHeaders} data={filteredCustomers} renderRow={renderCustomerRow} />}

            {/* View Transactions Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Transactions for ${selectedCustomer?.name}`}>
                {customerTransactions.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {customerTransactions.map(tx => (
                            <li key={tx.id} className="p-3 border border-border rounded-md flex justify-between items-center bg-background">
                                <div className="flex-1">
                                    <p className="font-medium text-textPrimary">{tx.description || 'Transaction'}</p>
                                    <p className="text-sm text-textSecondary">{new Date(tx.date).toLocaleDateString()}</p>
                                    <span className={`font-semibold text-lg ${tx.type === 'Received' ? 'text-danger' : 'text-success'}`}>
                                        {tx.type === 'Received' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-x-1">
                                    <button onClick={() => { setSelectedTransaction(tx); setFormState(tx); setIsEditTxModalOpen(true); }} className="p-1 text-warning rounded-full hover:bg-pill-warning-bg"><EditIcon /></button>
                                    <button onClick={() => handleDeleteTransaction(tx.id)} className="p-1 text-danger rounded-full hover:bg-pill-danger-bg"><TrashIcon /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No transactions found for this customer.</p>
                )}
            </Modal>
            
            {/* Edit Customer Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Customer: ${selectedCustomer?.name}`}>
                 <form onSubmit={handleUpdateCustomer}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Customer Name</label>
                        <input type="text" name="name" className={formInputStyle} value={formState.name || ''} onChange={handleFormChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                        <input type="text" name="phone" className={formInputStyle} value={formState.phone || ''} onChange={handleFormChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Address</label>
                        <input type="text" name="address" className={formInputStyle} value={formState.address || ''} onChange={handleFormChange} />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Status</label>
                        <select name="status" className={formInputStyle} value={formState.status || 'Active'} onChange={handleFormChange}>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Add Customer Modal */}
            <Modal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} title="Add New Customer">
                 <form onSubmit={handleAddCustomer}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Customer Name</label>
                        <input type="text" name="name" className={formInputStyle} placeholder="Enter full name" onChange={handleFormChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                        <input type="tel" name="phone" className={formInputStyle} placeholder="Enter 10-digit mobile number" onChange={handleFormChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Address</label>
                        <textarea name="address" className={formInputStyle} placeholder="Enter full address" onChange={handleFormChange}></textarea>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsAddCustomerModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">Add Customer</button>
                    </div>
                </form>
            </Modal>

            {/* Add/Edit Transaction Modal */}
            <Modal isOpen={isAddTxModalOpen || isEditTxModalOpen} onClose={() => { setIsAddTxModalOpen(false); setIsEditTxModalOpen(false); }} title={isEditTxModalOpen ? "Edit Transaction" : `Add Transaction for ${selectedCustomer?.name}`}>
                 <form onSubmit={isEditTxModalOpen ? handleUpdateTransaction : handleAddTransaction}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" name="date" className={formInputStyle} value={formState.date ? new Date(formState.date).toISOString().split('T')[0] : ''} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount (₹)</label>
                        <input type="number" name="amount" className={formInputStyle} placeholder="Enter amount" value={formState.amount || ''} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" name="description" className={formInputStyle} placeholder="e.g., Goods purchased" value={formState.description || ''} onChange={handleFormChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Transaction Type</label>
                        <select name="type" className={formInputStyle} value={formState.type || 'Given'} onChange={handleFormChange}>
                            <option>Given</option>
                            <option>Received</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => { setIsAddTxModalOpen(false); setIsEditTxModalOpen(false); }} className="px-4 py-2 mr-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">{isEditTxModalOpen ? "Save Changes" : "Save Transaction"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DailyBusinessPage;