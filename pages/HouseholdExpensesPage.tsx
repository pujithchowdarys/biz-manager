
import React, { useState, useEffect, useCallback, useContext } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { AuthContext } from '../contexts/AuthContext';
import { Expense } from '../types';
import { EditIcon, TrashIcon } from '../constants';

const HouseholdExpensesPage: React.FC = () => {
    const { supabase } = useContext(AuthContext);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [formState, setFormState] = useState<any>({});
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchData = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false });
        
        if (error) console.error(error);
        else setExpenses(data || []);
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
    
    const handleOpenModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>, expense: Expense | null = null, initialFormState = {}) => {
        setSelectedExpense(expense);
        setFormState(initialFormState);
        modalSetter(true);
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        const { error } = await supabase.from('expenses').insert([{
            expense_date: formState.expense_date,
            description: formState.description,
            category: formState.category,
            amount: parseFloat(formState.amount),
            type: formState.type
        }]);
        if (error) console.error(error);
        else {
            setIsAddModalOpen(false);
            fetchData();
        }
    };

    const handleUpdateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExpense || !supabase) return;
        const { error } = await supabase.from('expenses').update({
            expense_date: formState.expense_date,
            description: formState.description,
            category: formState.category,
            amount: parseFloat(formState.amount),
            type: formState.type
        }).eq('id', selectedExpense.id);
        if (error) console.error(error);
        else {
            setIsEditModalOpen(false);
            fetchData();
        }
    };

    const handleDeleteExpense = async (expenseId: number) => {
        if (!supabase) return;
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
            if (error) {
                console.error(error);
                showNotification(`Error deleting expense: ${error.message}`, 'error');
            } else {
                showNotification('Expense deleted successfully!', 'success');
                fetchData();
            }
        }
    };

    const overview = expenses.reduce((acc, curr) => {
        if (curr.type === 'Income') acc.totalIncome += curr.amount;
        else acc.totalExpenses += curr.amount;
        return acc;
    }, { totalIncome: 0, totalExpenses: 0 });
    const netBalance = overview.totalIncome - overview.totalExpenses;

    const tableHeaders = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Actions'];
    
    const filteredExpenses = expenses.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderExpenseRow = (expense: Expense) => (
        <tr key={expense.id} className="border-b border-border hover:bg-table-rowHover">
            <td className="p-4 text-textSecondary">{new Date(expense.expense_date).toLocaleDateString()}</td>
            <td className="p-4 font-medium text-textPrimary">
                {expense.description}
                <div className="md:hidden mt-2 space-x-2">
                    <button onClick={() => handleOpenModal(setIsEditModalOpen, expense, { ...expense })} className="p-1 text-warning rounded-full hover:bg-pill-warning-bg"><EditIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="p-1 text-danger rounded-full hover:bg-pill-danger-bg"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </td>
            <td className="p-4 text-textSecondary">{expense.category}</td>
            <td className={`p-4 font-semibold ${expense.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                ₹{expense.amount.toLocaleString()}
            </td>
            <td className="p-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${expense.type === 'Income' ? 'bg-pill-success-bg text-pill-success-text' : 'bg-pill-danger-bg text-pill-danger-text'}`}>
                    {expense.type}
                </span>
            </td>
            <td className="p-4 space-x-2 hidden md:table-cell">
                <button onClick={() => handleOpenModal(setIsEditModalOpen, expense, { ...expense })} className="p-1 text-warning rounded-full hover:bg-pill-warning-bg"><EditIcon /></button>
                <button onClick={() => handleDeleteExpense(expense.id)} className="p-1 text-danger rounded-full hover:bg-pill-danger-bg"><TrashIcon /></button>
            </td>
        </tr>
    );

    const formInputStyle = "w-full p-2 border border-border rounded-md bg-surface text-textPrimary focus:ring-primary focus:border-primary";

    if (!supabase) {
        return <div>Loading database connection...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-textPrimary">Household Expenses</h1>
            {notification && (
                <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-pill-success-bg text-pill-success-text' : 'bg-pill-danger-bg text-pill-danger-text'}`}>
                {notification.message}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Income" value={`₹${overview.totalIncome.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} color="bg-green-500" />
                <StatCard title="Total Expenses" value={`₹${overview.totalExpenses.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} color="bg-red-500" />
                <StatCard title="Net Balance" value={`₹${netBalance.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M5.5 9.5L14.5 5M18 20v-5h-5m3.5 1.5L9.5 19" /></svg>} color="bg-blue-500" />
            </div>

            <div className="bg-surface p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-2xl font-semibold text-textPrimary">Transactions</h2>
                     <div className="flex-grow max-w-md">
                         <input
                            type="text"
                            placeholder="Search by description or category..."
                            className="w-full p-2 border border-border rounded-md bg-surface text-textPrimary focus:ring-primary focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal(setIsAddModalOpen, null, { expense_date: new Date().toISOString().split('T')[0], type: 'Expense' })} className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap">
                        + Add Transaction
                    </button>
                </div>
            </div>

            {loading ? <p>Loading...</p> : <Table headers={tableHeaders} data={filteredExpenses} renderRow={renderExpenseRow} />}

            {/* Add/Edit Transaction Modal */}
            <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} title={isEditModalOpen ? "Edit Transaction" : "Add New Transaction"}>
                <form onSubmit={isEditModalOpen ? handleUpdateExpense : handleAddExpense}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" name="expense_date" className={formInputStyle} value={formState.expense_date || ''} onChange={handleFormChange} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" name="description" className={formInputStyle} value={formState.description || ''} onChange={handleFormChange} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Category</label>
                        <input type="text" name="category" className={formInputStyle} value={formState.category || ''} onChange={handleFormChange}/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount</label>
                        <input type="number" name="amount" className={formInputStyle} value={formState.amount || ''} onChange={handleFormChange} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Type</label>
                        <select name="type" className={formInputStyle} value={formState.type || 'Expense'} onChange={handleFormChange}>
                            <option>Income</option>
                            <option>Expense</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 mr-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">{isEditModalOpen ? 'Save Changes' : 'Save'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HouseholdExpensesPage;