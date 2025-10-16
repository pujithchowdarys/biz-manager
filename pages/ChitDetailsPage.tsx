import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { supabase } from '../supabaseClient';
import { Chit, ChitMember, ChitTransaction } from '../types';


const ChitDetailsPage: React.FC = () => {
    const { chitId } = useParams<{ chitId: string }>();
    const [chit, setChit] = useState<Chit | null>(null);
    const [members, setMembers] = useState<ChitMember[]>([]);
    const [transactions, setTransactions] = useState<ChitTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const [isTxModalOpen, setTxModalOpen] = useState(false);
    const [isAddTxModalOpen, setAddTxModalOpen] = useState(false);
    const [isEditMemberModalOpen, setEditMemberModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    
    const [selectedMember, setSelectedMember] = useState<ChitMember | null>(null);
    const [formState, setFormState] = useState<any>({});

    const fetchData = useCallback(async () => {
        if (!chitId) return;
        setLoading(true);

        const { data: chitData, error: chitError } = await supabase
            .from('chits')
            .select('*')
            .eq('id', chitId)
            .single();

        const { data: membersData, error: membersError } = await supabase
            .from('chit_members')
            .select('*')
            .eq('chit_id', chitId);

        if (chitError || membersError) {
            console.error(chitError || membersError);
            setLoading(false);
            return;
        }

        const memberIds = membersData.map(m => m.id);
        const { data: txData, error: txError } = await supabase
            .from('chit_transactions')
            .select('*')
            .in('member_id', memberIds);

        if (txError) {
            console.error(txError);
        } else {
            setChit(chitData);
            setTransactions(txData || []);
            const membersWithTotals = membersData.map(member => {
                const memberTxs = (txData || []).filter(tx => tx.member_id === member.id);
                const totalGiven = memberTxs.filter(t => t.type === 'Given').reduce((s, t) => s + t.amount, 0);
                const totalReceived = memberTxs.filter(t => t.type === 'Received').reduce((s, t) => s + t.amount, 0);
                const lastTx = memberTxs.length > 0 ? memberTxs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : 'N/A';
                return { ...member, totalGiven, totalReceived, lastTx };
            });
            setMembers(membersWithTotals);
        }
        setLoading(false);
    }, [chitId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        if(!selectedMember) return;
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
    
    const handleAddTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedMember) return;
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

    const memberHeaders = ['Member Name', 'Total Received', 'Total Given', 'Last Transaction', 'Lottery Status', 'Actions'];
  
    const renderMemberRow = (member: ChitMember) => (
         <tr key={member.id} className="border-b hover:bg-gray-50">
            <td className="p-4 font-medium text-textPrimary">{member.name}</td>
            <td className="p-4 text-green-600">₹{member.totalReceived.toLocaleString()}</td>
            <td className="p-4 text-red-600">₹{member.totalGiven.toLocaleString()}</td>
            <td className="p-4">{member.lastTx}</td>
            <td className="p-4">
               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.lottery_status === 'Won' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{member.lottery_status}</span>
            </td>
            <td className="p-4 space-x-2">
                <button onClick={() => handleOpenModal(setTxModalOpen, member)} className="text-primary hover:underline">Details</button>
                <button onClick={() => handleOpenModal(setEditMemberModalOpen, member, { ...member })} className="text-yellow-600 hover:underline">Edit</button>
                <button onClick={() => handleOpenModal(setAddTxModalOpen, member, { date: new Date().toISOString().split('T')[0], type: 'Given' })} className="text-blue-600 hover:underline">Add Tx</button>
            </td>
         </tr>
    );

    const memberTransactions = selectedMember ? transactions.filter(tx => tx.member_id === selectedMember.id) : [];
    const formInputStyle = "w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary";

    return (
        <div>
            <Link to="/chits" className="text-primary hover:underline mb-4 inline-block">← Back to All Chits</Link>
            <h1 className="text-3xl font-bold mb-2 text-textPrimary">Chit Details: {chit.name}</h1>
            <p className="text-lg text-textSecondary mb-6">Managing members for chit group.</p>
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-textPrimary">Members</h2>
                <button onClick={() => handleOpenModal(setIsAddMemberModalOpen, null)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                    + Add Member
                </button>
            </div>

            <Table headers={memberHeaders} data={members} renderRow={renderMemberRow} />

            {/* View Transactions Modal */}
            <Modal isOpen={isTxModalOpen} onClose={() => setTxModalOpen(false)} title={`Transactions for ${selectedMember?.name}`}>
                {memberTransactions.length > 0 ? (
                    <ul className="space-y-2">
                        {memberTransactions.map(tx => (
                            <li key={tx.id} className="p-2 border rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{tx.description} <span className="text-xs text-textSecondary">({tx.date})</span></p>
                                </div>
                                <span className={`font-semibold ${tx.type === 'Given' ? 'text-red-600' : 'text-green-600'}`}>
                                    {tx.type === 'Given' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No transactions found for this member.</p>
                )}
            </Modal>
            
            {/* Add Transaction Modal */}
            <Modal isOpen={isAddTxModalOpen} onClose={() => setAddTxModalOpen(false)} title={`Add Transaction for ${selectedMember?.name}`}>
                <form onSubmit={handleAddTransaction}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" name="date" value={formState.date || ''} onChange={handleFormChange} className={formInputStyle} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" name="description" placeholder="e.g., August Installment" onChange={handleFormChange} className={formInputStyle} />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount</label>
                        <input type="number" name="amount" onChange={handleFormChange} className={formInputStyle} required/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Type</label>
                        <select name="type" value={formState.type || 'Given'} onChange={handleFormChange} className={formInputStyle}>
                            <option>Given</option>
                            <option>Received</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setAddTxModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Transaction</button>
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
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Changes</button>
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
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Add Member</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ChitDetailsPage;