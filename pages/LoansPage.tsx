import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { MOCK_LOANS, MOCK_LOAN_TRANSACTIONS } from '../constants';
import { Loan, LoanTransaction } from '../types';

const LoansPage: React.FC = () => {
    const [loans] = useState<Loan[]>(MOCK_LOANS);
    const [isAddLoanModalOpen, setIsAddLoanModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewTxModalOpen, setIsViewTxModalOpen] = useState(false);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

    const overview = loans.reduce((acc, curr) => {
        if (curr.type === 'Taken') acc.loansTaken++;
        else acc.loansGiven++;
        acc.amountPaid += curr.paid;
        acc.balanceLeft += (curr.principal - curr.paid);
        return acc;
    }, { loansTaken: 0, loansGiven: 0, amountPaid: 0, balanceLeft: 0 });

    const handleEdit = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsEditModalOpen(true);
    };

    const handleView = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsViewTxModalOpen(true);
    };
    
    const handleAddPayment = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsAddPaymentModalOpen(true);
    };

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
                <button onClick={() => handleView(loan)} className="text-primary hover:underline">View</button>
                <button onClick={() => handleEdit(loan)} className="text-yellow-600 hover:underline">Edit</button>
                <button onClick={() => handleAddPayment(loan)} className="text-blue-600 hover:underline">Add Payment</button>
            </td>
        </tr>
    );

    const loanTransactions = selectedLoan ? MOCK_LOAN_TRANSACTIONS[selectedLoan.id] || [] : [];
    const formInputStyle = "w-full p-2 border rounded-md bg-white text-textPrimary";

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
                <button onClick={() => setIsAddLoanModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                    + Add Loan
                </button>
            </div>

            <Table headers={tableHeaders} data={loans} renderRow={renderLoanRow} />

            {/* Edit Loan Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Loan: ${selectedLoan?.name}`}>
                 <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Loan Name</label>
                        <input type="text" className={formInputStyle} defaultValue={selectedLoan?.name} />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Principal Amount</label>
                        <input type="number" className={formInputStyle} defaultValue={selectedLoan?.principal} />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Interest Rate (%)</label>
                        <input type="number" step="0.1" className={formInputStyle} defaultValue={selectedLoan?.interestRate} />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Duration (months)</label>
                        <input type="number" className={formInputStyle} defaultValue={selectedLoan?.duration} />
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Add Loan Modal */}
            <Modal isOpen={isAddLoanModalOpen} onClose={() => setIsAddLoanModalOpen(false)} title="Add New Loan">
                 <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Loan Name</label>
                        <input type="text" className={formInputStyle} placeholder="e.g., Personal Loan" />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Loan Amount (₹)</label>
                        <input type="number" className={formInputStyle} placeholder="e.g., 25000" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Loan Type</label>
                        <select className={formInputStyle}>
                            <option>Taken</option>
                            <option>Given</option>
                        </select>
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Interest Rate (%)</label>
                        <input type="number" step="0.1" className={formInputStyle} placeholder="e.g., 12.5" />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Duration (months)</label>
                        <input type="number" className={formInputStyle} placeholder="e.g., 24" />
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsAddLoanModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Add Loan</button>
                    </div>
                </form>
            </Modal>
            
             {/* View Transactions Modal */}
            <Modal isOpen={isViewTxModalOpen} onClose={() => setIsViewTxModalOpen(false)} title={`Transactions for ${selectedLoan?.name}`}>
                {loanTransactions.length > 0 ? (
                    <ul className="space-y-2">
                        {loanTransactions.map(tx => (
                            <li key={tx.id} className="p-2 border rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{tx.description} <span className="text-xs text-textSecondary">({tx.date})</span></p>
                                </div>
                                <span className={`font-semibold ${tx.type === 'Disbursement' ? 'text-red-600' : 'text-green-600'}`}>
                                    {tx.type === 'Disbursement' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No transactions found for this loan.</p>
                )}
            </Modal>

            {/* Add Payment Modal */}
            <Modal isOpen={isAddPaymentModalOpen} onClose={() => setIsAddPaymentModalOpen(false)} title={`Add Payment for ${selectedLoan?.name}`}>
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
                        <input type="text" className={formInputStyle} placeholder="e.g., Monthly EMI" />
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsAddPaymentModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Payment</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LoansPage;