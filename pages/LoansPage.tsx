
import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import { MOCK_LOANS } from '../constants';
import { Loan } from '../types';

const LoansPage: React.FC = () => {
    const [loans] = useState<Loan[]>(MOCK_LOANS);

    const overview = loans.reduce((acc, curr) => {
        if (curr.type === 'Taken') acc.loansTaken++;
        else acc.loansGiven++;
        acc.amountPaid += curr.paid;
        acc.balanceLeft += (curr.principal - curr.paid);
        return acc;
    }, { loansTaken: 0, loansGiven: 0, amountPaid: 0, balanceLeft: 0 });

    const tableHeaders = ['Loan Name', 'Principal', 'Paid', 'Balance', 'Type', 'Status', 'Actions'];

    const renderLoanRow = (loan: Loan) => (
        <tr key={loan.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium text-textPrimary">{loan.name}</td>
            <td className="p-4">₹{loan.principal.toLocaleString()}</td>
            <td className="p-4 text-green-600">₹{loan.paid.toLocaleString()}</td>
            <td className="p-4 font-semibold text-red-600">₹{(loan.principal - loan.paid).toLocaleString()}</td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${loan.type === 'Taken' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}`}>
                    {loan.type}
                </span>
            </td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${loan.status === 'Active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {loan.status}
                </span>
            </td>
            <td className="p-4 space-x-2">
                <button className="text-primary hover:underline">View</button>
                <button className="text-blue-600 hover:underline">Add Payment</button>
            </td>
        </tr>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-textPrimary">Loans Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Loans Taken" value={overview.loansTaken.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l-4 4m0 0l-4-4m4 4V3" /></svg>} color="bg-indigo-500" />
                <StatCard title="Loans Given" value={overview.loansGiven.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg>} color="bg-purple-500" />
                <StatCard title="Total Paid" value={`₹${overview.amountPaid.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} color="bg-green-500" />
                <StatCard title="Balance Left" value={`₹${overview.balanceLeft.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-red-500" />
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-textPrimary">All Loans</h2>
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                    + Add Loan
                </button>
            </div>

            <Table headers={tableHeaders} data={loans} renderRow={renderLoanRow} />
        </div>
    );
};

export default LoansPage;
