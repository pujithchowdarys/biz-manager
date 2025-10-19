
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { AuthContext } from '../contexts/AuthContext';
import { Chit, ChitMember, ChitTransaction } from '../types';
import { EditIcon, TrashIcon } from '../constants';


const ChitDetailsPage: React.FC = () => {
    const { supabase } = useContext(AuthContext);
    const { chitId } = useParams<{ chitId: string }>();
    const [chit, setChit] = useState<Chit | null>(null);
    const [members, setMembers] = useState<ChitMember[]>([]);
    const [transactions, setTransactions] = useState<ChitTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isTxModalOpen, setTxModalOpen] = useState(false);
    const [isAddTxModalOpen, setAddTxModalOpen] = useState(false);
    const [isEditMemberModalOpen, setEditMemberModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isEditTxModalOpen, setEditTxModalOpen] = useState(false);
    
    const [selectedMember, setSelectedMember] = useState<ChitMember | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<ChitTransaction | null>(null);
    const [formState, setFormState] = useState<any>({});
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchData = useCallback(async () => {
        if (!chitId || !supabase) return;
        setLoading(true);

        try {
            const { data: chitData, error: chitError } = await supabase
                .from('chits')
                .select(`
                    *,
                    chit_members (
                        *,
                        chit_transactions (*)
                    )
                `)
                .eq('id', chitId)
                .single();

            if (chitError) throw chitError;

            if (chitData) {
                const allTransactions: ChitTransaction[] = [];
                const membersWithTotals = ((chitData.chit_members as any[]) || []).map(member => {
                    const memberTxs = (member.chit_transactions as ChitTransaction[]) || [];
                    allTransactions.push(...memberTxs);
                    
                    const totalGiven = memberTxs.filter(t => t.type === 'Given').reduce((s, t) => s + t.amount, 0);
                    const totalReceived = memberTxs.filter(t => t.type === 'Received').reduce((s, t) => s + t.amount, 0);
                    const lastTx = memberTxs.length > 0 ? memberTxs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : 'N/A';
                    
                    const { chit_transactions, ...restOfMember } = member;
                    return { ...restOfMember, totalGiven, totalReceived, lastTx };
                });
                
                const { chit_members, ...restOfChit } = chitData;

                setChit(restOfChit as Chit);
                setMembers(membersWithTotals as ChitMember[]);
                setTransactions(allTransactions);
            }

        } catch (error: any) {
            console.error("Error fetching chit details:", error.message || error);
        } finally {
            setLoading(false);
        }
    }, [chitId, supabase]);

    useEffect(() => {
        if (supabase) {
            fetchData();
        }
    }, [fetchData, supabase]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>, member: ChitMember | null = null, initialFormState = {}) => {
        setSelectedMember(member);
        setFormState(initialFormState);
        modalSetter(true);
    };
    
    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        const { error } = await supabase.from('chit_members').insert([{
            chit_id: parseInt(chitId || ''),
            name: formState.name,
            phone: formState.phone,
            email: formState.email,
            address: formState.address,
        }]);
        if (error) console.error(error);
        else {
            setIsAddMemberModalOpen(false);
            fetchData();
        }
    };
    
    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedMember || !supabase) return;
        const { error } = await supabase.from('chit_members').update({
             name: formState.name,
            phone: formState.phone,
            email: formState.email,
            address: formState.address,
        }).eq('id', selectedMember.id);
        if(error) console.error(error);
        else {
            setEditMemberModalOpen(false);
            fetchData();
        }
    };
    
    const handleDeleteMember = async (memberId: number) => {
        if (!supabase) return;
        if (window.confirm('Are you sure you want to delete this member and all their transactions?')) {
            await supabase.from('chit_transactions').delete().eq('member_id', memberId);
            const { error } = await supabase.from('chit_members').delete().eq('id', memberId);
            if (error) {
                console.error(error);
                showNotification(`Error deleting member: ${error.message}`, 'error');
            } else {
                showNotification('Member deleted successfully!', 'success');
                fetchData();
            }
        }
    };
    
    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedMember || !supabase) return;
        const { error } = await supabase.from('chit_transactions').insert([{
            member_id: selectedMember.id,
            date: formState.date,
            description: formState.description,
            amount: parseFloat(formState.amount),
            type: formState.type
        }]);
        if(error) console.error(error);
        else {
            setAddTxModalOpen(false);
            fetchData();
        }
    };
    
    const handleUpdateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransaction || !supabase) return;
        const { error } = await supabase.from('chit_transactions').update({
            date: formState.date,
            description: formState.description,
            amount: parseFloat(formState.amount),
            type: formState.type
        }).eq('id', selectedTransaction.id);
        
        if (error) console.error(error);
        else {
            setEditTxModalOpen(false);
            fetchData();
        }
    };

    const handleDeleteTransaction = async (transactionId: number) => {
        if (!supabase) return;
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            const { error } = await supabase.from('chit_transactions').delete().eq('id', transactionId);
            if (error) {
                console.error(error);
                showNotification(`Error deleting transaction: ${error.message}`, 'error');
            } else {
                showNotification('Transaction deleted successfully!', 'success');
                setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
                fetchData(); // Recalculate totals
            }
        }
    };

    const handleUpdateLotteryStatus = async (memberId: number, newStatus: 'Pending' | 'Won') => {
        if (!supabase) return;
        const { error } = await supabase
            .from('chit_members')
            .update({ lottery_status: newStatus })
            .eq('id', memberId);
        
        if (error) {
            console.error(error);
            showNotification(`Error updating status: ${error.message}`, 'error');
        } else {
            showNotification('Lottery status updated successfully!', 'success');
            fetchData(); // Refresh data to show change
        }
    };

    if (loading) return <p>Loading chit details...</p>;
    if (!chit) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6 text-textPrimary">Chit Not Found</h1>
                <p className="text-textSecondary">The requested chit could not be found.</p>
                <Link to="/chits" className="text-primary hover:underline mt-4 inline-block">← Back to Chits</Link>
            </div>
        );
    }

    const memberHeaders = ['Member Name', 'Total Given', 'Total Received', 'Last Transaction', 'Lottery Status', 'Actions'];
  
    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderMemberRow = (member: ChitMember) => (
         <tr key={member.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium text-textPrimary">
                {member.name}
                <div className="md:hidden mt-2 space-x-2">
                    <button onClick={() => handleOpenModal(setTxModalOpen, member)} className="text-primary hover:underline text-sm">Details</button>
                    <button onClick={() => handleOpenModal(setAddTxModalOpen, member, { date: new Date().toISOString().split('T')[0], type: 'Given' })} className="text-blue-600 hover:underline text-sm">Add Tx</button>
                    <button onClick={() => handleOpenModal(setEditMemberModalOpen, member, { ...member })} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"><EditIcon className="h-4 w-4" /></button>
                    <button onClick={() => handleDeleteMember(member.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </td>
            <td className="p-4 text-green-600">₹{member.totalGiven.toLocaleString()}</td>
            <td className="p-4 text-red-600">₹{member.totalReceived.toLocaleString()}</td>
            <td className="p-4 text-textPrimary">{member.lastTx}</td>
            <td className="p-4">
               <select 
                    value={member.lottery_status}
                    onChange={(e) => handleUpdateLotteryStatus(member.id, e.target.value as 'Pending' | 'Won')}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-transparent focus:border-primary focus:ring-1 focus:ring-primary ${member.lottery_status === 'Won' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                    <option value="Pending">Pending</option>
                    <option value="Won">Won</option>
                </select>
            </td>
            <td className="p-4 space-x-2 whitespace-nowrap hidden md:table-cell">
                <button onClick={() => handleOpenModal(setTxModalOpen, member)} className="text-primary hover:underline">Details</button>
                <button onClick={() => handleOpenModal(setAddTxModalOpen, member, { date: new Date().toISOString().split('T')[0], type: 'Given' })} className="text-blue-600 hover:underline">Add Tx</button>
                <button onClick={() => handleOpenModal(setEditMemberModalOpen, member, { ...member })} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"><EditIcon /></button>
                <button onClick={() => handleDeleteMember(member.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
            </td>
         </tr>
    );

    const memberTransactions = selectedMember ? transactions.filter(tx => tx.member_id === selectedMember.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
    const formInputStyle = "w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary";

    return (
        <div>
            <Link to="/chits" className="text-primary hover:underline mb-4 inline-block">← Back to All Chits</Link>
            <h1 className="text-3xl font-bold mb-2 text-textPrimary">Chit Details: {chit.name}</h1>
            <p className="text-lg text-textSecondary mb-6">Managing members for chit group.</p>
            
            {notification && (
                <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {notification.message}
                </div>
            )}

            <div className="bg-surface p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-2xl font-semibold text-textPrimary">Members</h2>
                     <div className="flex-grow max-w-md">
                         <input
                            type="text"
                            placeholder="Search members..."
                            className="w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal(setIsAddMemberModalOpen, null)} className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap">
                        + Add Member
                    </button>
                </div>
            </div>

            <Table headers={memberHeaders} data={filteredMembers} renderRow={renderMemberRow} />

            {/* View Transactions Modal */}
            <Modal isOpen={isTxModalOpen} onClose={() => setTxModalOpen(false)} title={`Transactions for ${selectedMember?.name}`}>
                {memberTransactions.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {memberTransactions.map(tx => (
                            <li key={tx.id} className="p-3 border rounded-md flex justify-between items-center bg-white">
                                <div className="flex-1">
                                    <p className="font-medium">{tx.description || 'Transaction'} <span className="text-xs text-textSecondary">({tx.date})</span></p>
                                    <span className={`font-semibold ${tx.type === 'Given' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'Given' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-x-1">
                                    <button onClick={() => { setSelectedTransaction(tx); setFormState(tx); setEditTxModalOpen(true); }} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"><EditIcon /></button>
                                    <button onClick={() => handleDeleteTransaction(tx.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No transactions found for this member.</p>
                )}
            </Modal>
            
            {/* Add/Edit Transaction Modal */}
            <Modal isOpen={isAddTxModalOpen || isEditTxModalOpen} onClose={() => { setAddTxModalOpen(false); setEditTxModalOpen(false); }} title={isEditTxModalOpen ? "Edit Transaction" : `Add Transaction for ${selectedMember?.name}`}>
                <form onSubmit={isEditTxModalOpen ? handleUpdateTransaction : handleAddTransaction}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" name="date" value={formState.date ? new Date(formState.date).toISOString().split('T')[0] : ''} onChange={handleFormChange} className={formInputStyle} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" name="description" placeholder="e.g., August Installment" value={formState.description || ''} onChange={handleFormChange} className={formInputStyle} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount</label>
                        <input type="number" name="amount" value={formState.amount || ''} onChange={handleFormChange} className={formInputStyle} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Type</label>
                        <select name="type" value={formState.type || 'Given'} onChange={handleFormChange} className={formInputStyle}>
                            <option>Given</option>
                            <option>Received</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => { setAddTxModalOpen(false); setEditTxModalOpen(false); }} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">{isEditTxModalOpen ? "Save Changes" : "Save Transaction"}</button>
                    </div>
                </form>
            </Modal>
            
            {/* Edit Member Modal */}
            <Modal isOpen={isEditMemberModalOpen} onClose={() => setEditMemberModalOpen(false)} title={`Edit Member: ${selectedMember?.name}`}>
                 <form onSubmit={handleUpdateMember}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Member Name</label>
                        <input type="text" name="name" className={formInputStyle} value={formState.name || ''} onChange={handleFormChange} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                        <input type="tel" name="phone" className={formInputStyle} value={formState.phone || ''} onChange={handleFormChange}/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
                        <input type="email" name="email" className={formInputStyle} value={formState.email || ''} onChange={handleFormChange}/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Address</label>
                        <textarea name="address" className={formInputStyle} value={formState.address || ''} onChange={handleFormChange}></textarea>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setEditMemberModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Add Member Modal */}
            <Modal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} title="Add New Member">
                 <form onSubmit={handleAddMember}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Member Name</label>
                        <input type="text" name="name" placeholder="Enter full name" className={formInputStyle} onChange={handleFormChange} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Phone Number</label>
                        <input type="tel" name="phone" placeholder="Enter 10-digit mobile number" className={formInputStyle} onChange={handleFormChange}/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
                        <input type="email" name="email" placeholder="Enter email address" className={formInputStyle} onChange={handleFormChange}/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Address</label>
                        <textarea name="address" placeholder="Enter full address" className={formInputStyle} onChange={handleFormChange}></textarea>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setIsAddMemberModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">Add Member</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ChitDetailsPage;
