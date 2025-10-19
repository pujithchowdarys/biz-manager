
import React, { useState, useEffect, useCallback, useContext } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { AuthContext } from '../contexts/AuthContext';
import { Loan, LoanTransaction } from '../types';
import { EditIcon, TrashIcon } from '../constants';

const LoansPage: React.FC = () => {
    const { supabase } = useContext(AuthContext);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isAddLoanModalOpen, setIsAddLoanModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewTxModalOpen, setIsViewTxModalOpen] = useState(false);
    const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
    const [isEditTxModalOpen, setIsEditTxModalOpen] = useState(false);
    
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<LoanTransaction | null>(null);
    const [formState, setFormState] = useState<any>({});
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchData = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const { data: loansData, error: loansError } = await supabase.from('loans').select('*').order('name');
        const { data: txData, error: txError } = await supabase.from('loan_transactions').select('*');

        if (loansError || txError) {
            console.error(loansError || txError);
        } else if (loansData && txData) {
            setTransactions(txData);
            const loansWithTotals = loansData.map(loan => {
                const paid = txData
                    .filter(tx => tx.loan_id === loan.id && tx.type === 'Payment')
                    .reduce((sum, tx) => sum + tx.amount, 0);
                return { ...loan, paid };
            });
            setLoans(loansWithTotals);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        if (supabase) {
            fetchData();
        }
    }, [fetchData, supabase]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>, loan: Loan | null = null, initialFormState = {}) => {
        setSelectedLoan(loan);
        setFormState(initialFormState);
        modalSetter(true);
    };

    const handleAddLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        const { data, error } = await supabase.from('loans').insert([{
            name: formState.name,
            principal: parseFloat(formState.principal),
            type: formState.type,
            interest_rate: parseFloat(formState.interest_rate),
            duration_months: parseInt(formState.duration_months),
            status: 'Active'
        }]).select();

        if (error) console.error(error);
        else if (data) {
            // Add the initial disbursement transaction
            await supabase.from('loan_transactions').insert([{
                loan_id: data[0].id,
                date: new Date().toISOString().split('T')[0],
                amount: parseFloat(formState.principal),
                description: 'Loan Disbursement',
                type: 'Disbursement'
            }]);
            setIsAddLoanModalOpen(false);
            fetchData();
        }
    };
    
    const handleUpdateLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedLoan || !supabase) return;
        const { error } = await supabase.from('loans').update({
            name: formState.name,
            interest_rate: parseFloat(formState.interest_rate),
            duration_months: parseInt(formState.duration_months),
        }).eq('id', selectedLoan.id);
        
        if (error) console.error(error);
        else {
            setIsEditModalOpen(false);
            fetchData();
        }
    };

    const handleDeleteLoan = async (loanId: number) => {
        if (!supabase) return;
        if (window.confirm('Are you sure you want to delete this loan and all its payments?')) {
            await supabase.from('loan_transactions').delete().eq('loan_id', loanId);
            const { error } = await supabase.from('loans').delete().eq('id', loanId);
            if (error) {
                console.error(error);
                showNotification(`Error deleting loan: ${error.message}`, 'error');
            } else {
                showNotification('Loan deleted successfully!', 'success');
                fetchData();
            }
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan || !supabase) return;
        const { error } = await supabase.from('loan_transactions').insert([{
            loan_id: selectedLoan.id,
            date: formState.date,
            amount: parseFloat(formState.amount),
            description: formState.description,
            type: 'Payment'
        }]);

        if (error) console.error(error);
        else {
            setIsAddPaymentModalOpen(false);
            fetchData();
        }
    };

    const handleUpdateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransaction || !supabase) return;
        const { error } = await supabase.from('loan_transactions').update({
            date: formState.date,
            amount: parseFloat(formState.amount),
            description: formState.description
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
            const { error } = await supabase.from('loan_transactions').delete().eq('id', transactionId);
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

    const overview = loans.reduce((acc, curr) => {
        if (curr.type === 'Taken') acc.loansTaken++;
        else acc.loansGiven++;
        acc.amountPaid += curr.paid;
        acc.balanceLeft += (curr.principal - curr.paid);
        return acc;
    }, { loansTaken: 0, loansGiven: 0, amountPaid: 0, balanceLeft: 0 });

    const tableHeaders = ['Loan Name', 'Principal', 'Paid', 'Balance', 'Type', 'Status', 'Actions'];

    const filteredLoans = loans.filter(loan =>
        loan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderLoanRow = (loan: Loan) => (
        <tr key={loan.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium text-textPrimary">
                {loan.name}
                <div className="md:hidden mt-2 space-x-2">
                    <button onClick={() => handleOpenModal(setIsViewTxModalOpen, loan)} className="text-primary hover:underline text-sm">View</button>
                    <button onClick={() => handleOpenModal(setIsAddPaymentModalOpen, loan, { date: new Date().toISOString().split('T')[0] })} className="text-blue-600 hover:underline text-sm">Add Payment</button>
                    <button onClick={() => handleOpenModal(setIsEditModalOpen, loan, { ...loan })} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"><EditIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDeleteLoan(loan.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </td>
            <td className="p-4 text-textPrimary">₹{loan.principal.toLocaleString()}</td>
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
            <td className="p-4 space-x-2 whitespace-nowrap hidden md:table-cell">
                <button onClick={() => handleOpenModal(setIsViewTxModalOpen, loan)} className="text-primary hover:underline">View</button>
                <button onClick={() => handleOpenModal(setIsAddPaymentModalOpen, loan, { date: new Date().toISOString().split('T')[0] })} className="text-blue-600 hover:underline">Add Payment</button>
                <button onClick={() => handleOpenModal(setIsEditModalOpen, loan, { ...loan })} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"><EditIcon /></button>
                <button onClick={() => handleDeleteLoan(loan.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
            </td>
        </tr>
    );

    const loanTransactions = selectedLoan ? transactions.filter(tx => tx.loan_id === selectedLoan.id) : [];
    const formInputStyle = "w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary";
    
    if (!supabase) {
        return <div>Loading database connection...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-textPrimary">Loans Management</h1>
            {notification && (
                <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {notification.message}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Loans Taken" value={overview.loansTaken.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l-4 4m0 0l-4-4m4 4V3" /></svg>} color="bg-indigo-500" />
                <StatCard title="Loans Given" value={overview.loansGiven.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg>} color="bg-purple-500" />
                <StatCard title="Total Paid" value={`₹${overview.amountPaid.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} color="bg-green-500" />
                <StatCard title="Balance Left" value={`₹${overview.balanceLeft.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-red-500" />
            </div>

            <div className="bg-surface p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-2xl font-semibold text-textPrimary">All Loans</h2>
                     <div className="flex-grow max-w-md">
                         <input
                            type="text"
                            placeholder="Search loans..."
                            className="w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal(setIsAddLoanModalOpen, null, { type: 'Taken' })} className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap">
                        + Add Loan
                    </button>
                </div>
            </div>

            {loading ? <p>Loading...</p> : <Table headers={tableHeaders} data={filteredLoans} renderRow={renderLoanRow} />}

            {/* Edit Loan Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Loan: ${selectedLoan?.name}`}>
                 <form onSubmit={handleUpdateLoan}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Loan Name</label>
                        <input type="text" name="name" className={formInputStyle} value={formState.name || ''} onChange={handleFormChange} required/>
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Interest Rate (%)</label>
                        <input type="number" step="0.1" name="interest_rate" className={formInputStyle} value={formState.interest_rate || ''} onChange={handleFormChange}/>
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Duration (months)</label>
                        <input type="number" name="duration_months" className={formInputStyle} value={formState.duration_months || ''} onChange={handleFormChange}/>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Add Loan Modal */}
            <Modal isOpen={isAddLoanModalOpen} onClose={() => setIsAddLoanModalOpen(false)} title="Add New Loan">
                 <form onSubmit={handleAddLoan}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Loan Name</label>
                        <input type="text" name="name" className={formInputStyle} placeholder="e.g., Personal Loan" onChange={handleFormChange} required/>
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Loan Amount (₹)</label>
                        <input type="number" name="principal" className={formInputStyle} placeholder="e.g., 25000" onChange={handleFormChange} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Loan Type</label>
                        <select name="type" className={formInputStyle} value={formState.type} onChange={handleFormChange}>
                            <option>Taken</option>
                            <option>Given</option>
                        </select>
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Interest Rate (%)</label>
                        <input type="number" step="0.1" name="interest_rate" className={formInputStyle} placeholder="e.g., 12.5" onChange={handleFormChange}/>
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Duration (months)</label>
                        <input type="number" name="duration_months" className={formInputStyle} placeholder="e.g., 24" onChange={handleFormChange}/>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsAddLoanModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">Add Loan</button>
                    </div>
                </form>
            </Modal>
            
             {/* View Transactions Modal */}
            <Modal isOpen={isViewTxModalOpen} onClose={() => setIsViewTxModalOpen(false)} title={`Transactions for ${selectedLoan?.name}`}>
                {loanTransactions.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {loanTransactions.map(tx => (
                            <li key={tx.id} className="p-3 border rounded-md flex justify-between items-center bg-white">
                                <div className="flex-1">
                                    <p className="font-medium">{tx.description} <span className="text-xs text-textSecondary">({tx.date})</span></p>
                                    <span className={`font-semibold ${tx.type === 'Disbursement' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'Disbursement' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-x-1">
                                     <button onClick={() => { setSelectedTransaction(tx); setFormState(tx); setIsEditTxModalOpen(true); }} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"><EditIcon /></button>
                                     <button onClick={() => handleDeleteTransaction(tx.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                 </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No transactions found for this loan.</p>
                )}
            </Modal>

            {/* Add/Edit Payment Modal */}
            <Modal isOpen={isAddPaymentModalOpen || isEditTxModalOpen} onClose={() => { setIsAddPaymentModalOpen(false); setIsEditTxModalOpen(false); }} title={isEditTxModalOpen ? "Edit Transaction" : `Add Payment for ${selectedLoan?.name}`}>
                 <form onSubmit={isEditTxModalOpen ? handleUpdateTransaction : handleAddPayment}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" name="date" className={formInputStyle} value={formState.date ? new Date(formState.date).toISOString().split('T')[0] : ''} onChange={handleFormChange} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount (₹)</label>
                        <input type="number" name="amount" className={formInputStyle} placeholder="Enter amount" value={formState.amount || ''} onChange={handleFormChange} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" name="description" className={formInputStyle} placeholder="e.g., Monthly EMI" value={formState.description || ''} onChange={handleFormChange} required/>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => { setIsAddPaymentModalOpen(false); setIsEditTxModalOpen(false); }} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">{isEditTxModalOpen ? "Save Changes" : "Save Payment"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LoansPage;
