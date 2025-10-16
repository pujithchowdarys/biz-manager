import React, { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { supabase } from '../supabaseClient';
import { Customer, CustomerTransaction } from '../types';

const DailyBusinessPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [formState, setFormState] = useState<any>({});
    
    const fetchData = useCallback(async () => {
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
            const customersWithTotals = customersData.map(customer => {
                const txs = transactionsData.filter(tx => tx.customer_id === customer.id);
                const totalGiven = txs.filter(t => t.type === 'Given').reduce((sum, t) => sum + t.amount, 0);
                const totalReceived = txs.filter(t => t.type === 'Received').reduce((sum, t) => sum + t.amount, 0);
                return { ...customer, totalGiven, totalReceived };
            });
            setCustomers(customersWithTotals);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        if (!selectedCustomer) return;
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

    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
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
    
    const overview = customers.reduce((acc, curr) => {
        acc.totalGiven += curr.totalGiven;
        acc.totalReceived += curr.totalReceived;
        return acc;
    }, { totalGiven: 0, totalReceived: 0 });
    const balance = overview.totalGiven - overview.totalReceived;
    
    const tableHeaders = ['Customer Name', 'Total Given', 'Total Received', 'Balance', 'Status', 'Actions'];

    const renderCustomerRow = (customer: Customer) => (
        <tr key={customer.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium text-textPrimary">{customer.name}</td>
            <td className="p-4 text-green-600">₹{customer.totalGiven.toLocaleString()}</td>
            <td className="p-4 text-red-600">₹{customer.totalReceived.toLocaleString()}</td>
            <td className={`p-4 font-semibold ${customer.totalGiven - customer.totalReceived >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ₹{(customer.totalGiven - customer.totalReceived).toLocaleString()}
            </td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {customer.status}
                </span>
            </td>
            <td className="p-4 space-x-2">
                <button onClick={() => { setSelectedCustomer(customer); setIsViewModalOpen(true); }} className="text-primary hover:underline">View</button>
                <button onClick={() => handleOpenModal(setIsEditModalOpen, customer, { ...customer })} className="text-yellow-600 hover:underline">Edit</button>
                <button onClick={() => handleOpenModal(setIsAddTxModalOpen, customer, { date: new Date().toISOString().split('T')[0], type: 'Given' })} className="text-blue-600 hover:underline">Add Tx</button>
            </td>
        </tr>
    );

    const formInputStyle = "w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary";

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-textPrimary">Daily Business</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Given" value={`₹${overview.totalGiven.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>} color="bg-green-500" />
                <StatCard title="Total Received" value={`₹${overview.totalReceived.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="bg-red-500" />
                <StatCard title="Balance" value={`₹${balance.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M5.5 9.5L14.5 5M18 20v-5h-5m3.5 1.5L9.5 19" /></svg>} color="bg-blue-500" />
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-textPrimary">Customers</h2>
                <button onClick={() => handleOpenModal(setIsAddCustomerModalOpen, null)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                    + Add Customer
                </button>
            </div>
            
            {loading ? <p>Loading...</p> : <Table headers={tableHeaders} data={customers} renderRow={renderCustomerRow} />}

            {/* View Transactions Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Transactions for ${selectedCustomer?.name}`}>
                {/* Content to be implemented */}
                <p>Transaction history functionality to be added.</p>
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
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Changes</button>
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
                        <button type="button" onClick={() => setIsAddCustomerModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Add Customer</button>
                    </div>
                </form>
            </Modal>

            {/* Add Transaction Modal */}
            <Modal isOpen={isAddTxModalOpen} onClose={() => setIsAddTxModalOpen(false)} title={`Add Transaction for ${selectedCustomer?.name}`}>
                 <form onSubmit={handleAddTransaction}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" name="date" className={formInputStyle} value={formState.date || ''} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount (₹)</label>
                        <input type="number" name="amount" className={formInputStyle} placeholder="Enter amount" onChange={handleFormChange} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" name="description" className={formInputStyle} placeholder="e.g., Goods purchased" onChange={handleFormChange} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Transaction Type</label>
                        <select name="type" className={formInputStyle} value={formState.type || 'Given'} onChange={handleFormChange}>
                            <option>Given</option>
                            <option>Received</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsAddTxModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Transaction</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DailyBusinessPage;