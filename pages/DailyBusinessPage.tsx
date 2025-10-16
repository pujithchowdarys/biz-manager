import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useEffect } from 'react'; // React's hook for side effects
import { supabase } from '../supabaseClient'; // Our new client
import { Customer } from '../types';

const DailyBusinessPage: React.FC = () => {
    //const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const [customers, setCustomers] = useState<Customer[]>([]); // Start with an empty array
    const [loading, setLoading] = useState(true);

    async function getCustomers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('customers') // The name of your table
            .select('*'); // Get all columns

        if (error) {
            console.warn(error);
        } else if (data) {
            // Here you would need to calculate totals, as they are not in the DB
            // For now, let's just add placeholder values
            const customersWithTotals = data.map(c => ({...c, totalGiven: 0, totalReceived: 0}));
            setCustomers(customersWithTotals);
        }
        setLoading(false);
    }

    useEffect(() => {
        getCustomers();
    }, []);
    

    const overview = customers.reduce((acc, curr) => {
        acc.totalGiven += curr.totalGiven;
        acc.totalReceived += curr.totalReceived;
        return acc;
    }, { totalGiven: 0, totalReceived: 0 });

    const balance = overview.totalGiven - overview.totalReceived;

    const handleView = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsViewModalOpen(true);
    };
    
    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    const handleAddTransaction = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsAddTxModalOpen(true);
    }

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
                <button onClick={() => handleView(customer)} className="text-primary hover:underline">View</button>
                <button onClick={() => handleEdit(customer)} className="text-yellow-600 hover:underline">Edit</button>
                <button onClick={() => handleAddTransaction(customer)} className="text-blue-600 hover:underline">Add Tx</button>
            </td>
        </tr>
    );

    const formInputStyle = "w-full p-2 border rounded-md bg-white text-textPrimary";

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
                <button onClick={() => setIsAddCustomerModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                    + Add Customer
                </button>
            </div>
            
            <Table headers={tableHeaders} data={customers} renderRow={renderCustomerRow} />

            {/* View Transactions Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Transactions for ${selectedCustomer?.name}`}>
                <p>This is where the transaction history for {selectedCustomer?.name} would be displayed.</p>
                 <div className="mt-4 text-sm">
                    <p><strong>Total Given:</strong> ₹{selectedCustomer?.totalGiven.toLocaleString()}</p>
                    <p><strong>Total Received:</strong> ₹{selectedCustomer?.totalReceived.toLocaleString()}</p>
                    <p className="font-bold"><strong>Balance:</strong> ₹{(selectedCustomer?.totalGiven ?? 0 - (selectedCustomer?.totalReceived ?? 0)).toLocaleString()}</p>
                </div>
            </Modal>
            
            {/* Edit Customer Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Customer: ${selectedCustomer?.name}`}>
                 <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Customer Name</label>
                        <input type="text" className={formInputStyle} defaultValue={selectedCustomer?.name} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                        <input type="text" className={formInputStyle} defaultValue={selectedCustomer?.phone} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Address</label>
                        <input type="text" className={formInputStyle} defaultValue={selectedCustomer?.address} />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Status</label>
                        <select className={formInputStyle} defaultValue={selectedCustomer?.status}>
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
                 <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Customer Name</label>
                        <input type="text" className={formInputStyle} placeholder="Enter full name" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                        <input type="tel" className={formInputStyle} placeholder="Enter 10-digit mobile number" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Address</label>
                        <textarea className={formInputStyle} placeholder="Enter full address"></textarea>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsAddCustomerModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Add Customer</button>
                    </div>
                </form>
            </Modal>

            {/* Add Transaction Modal */}
            <Modal isOpen={isAddTxModalOpen} onClose={() => setIsAddTxModalOpen(false)} title={`Add Transaction for ${selectedCustomer?.name}`}>
                 <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" className={formInputStyle} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount (₹)</label>
                        <input type="number" className={formInputStyle} placeholder="Enter amount" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" className={formInputStyle} placeholder="e.g., Goods purchased" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Transaction Type</label>
                        <select className={formInputStyle}>
                            <option>Given</option>
                            <option>Taken</option>
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