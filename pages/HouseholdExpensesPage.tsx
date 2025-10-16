
import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { MOCK_EXPENSES } from '../constants';
import { Expense } from '../types';

const HouseholdExpensesPage: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const overview = expenses.reduce((acc, curr) => {
        if (curr.type === 'Income') acc.totalIncome += curr.amount;
        else acc.totalExpenses += curr.amount;
        return acc;
    }, { totalIncome: 0, totalExpenses: 0 });

    const netBalance = overview.totalIncome - overview.totalExpenses;

    const tableHeaders = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Actions'];

    const renderExpenseRow = (expense: Expense) => (
        <tr key={expense.id} className="border-b hover:bg-gray-50">
            <td className="p-4 text-textSecondary">{expense.date}</td>
            <td className="p-4 font-medium text-textPrimary">{expense.description}</td>
            <td className="p-4 text-textSecondary">{expense.category}</td>
            <td className={`p-4 font-semibold ${expense.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                ₹{expense.amount.toLocaleString()}
            </td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${expense.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {expense.type}
                </span>
            </td>
            <td className="p-4 space-x-2">
                <button className="text-primary hover:underline">Edit</button>
                <button className="text-red-600 hover:underline">Remove</button>
            </td>
        </tr>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-textPrimary">Household Expenses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Income" value={`₹${overview.totalIncome.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} color="bg-green-500" />
                <StatCard title="Total Expenses" value={`₹${overview.totalExpenses.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} color="bg-red-500" />
                <StatCard title="Net Balance" value={`₹${netBalance.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M5.5 9.5L14.5 5M18 20v-5h-5m3.5 1.5L9.5 19" /></svg>} color="bg-blue-500" />
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-textPrimary">Transactions</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                    + Add Transaction
                </button>
            </div>

            <Table headers={tableHeaders} data={expenses} renderRow={renderExpenseRow} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Transaction">
                <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Category</label>
                        <input type="text" className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount</label>
                        <input type="number" className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Type</label>
                        <select className="w-full p-2 border rounded-md">
                            <option>Income</option>
                            <option>Expense</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HouseholdExpensesPage;
