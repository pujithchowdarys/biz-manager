
import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { MOCK_CUSTOMERS } from '../constants';
import { Customer } from '../types';

const DailyBusinessPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const overview = customers.reduce((acc, curr) => {
        acc.totalGiven += curr.totalGiven;
        acc.totalReceived += curr.totalReceived;
        return acc;
    }, { totalGiven: 0, totalReceived: 0 });

    const balance = overview.totalGiven - overview.totalReceived;

    const handleView = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

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
                <button className="text-blue-600 hover:underline">Add Tx</button>
            </td>
        </tr>
    );

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
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                    + Add Customer
                </button>
            </div>
            
            <Table headers={tableHeaders} data={customers} renderRow={renderCustomerRow} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Transactions for ${selectedCustomer?.name}`}>
                <p>This is where the transaction history for {selectedCustomer?.name} would be displayed.</p>
                 <div className="mt-4 text-sm">
                    <p><strong>Total Given:</strong> ₹{selectedCustomer?.totalGiven.toLocaleString()}</p>
                    <p><strong>Total Received:</strong> ₹{selectedCustomer?.totalReceived.toLocaleString()}</p>
                    <p className="font-bold"><strong>Balance:</strong> ₹{(selectedCustomer?.totalGiven ?? 0 - (selectedCustomer?.totalReceived ?? 0)).toLocaleString()}</p>
                </div>
            </Modal>
        </div>
    );
};

export default DailyBusinessPage;
