
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { MOCK_CHITS, MOCK_CHIT_MEMBERS, MOCK_MEMBER_TRANSACTIONS } from '../constants';
import { ChitMember, MemberTransaction } from '../types';

const ChitDetailsPage: React.FC = () => {
    const { chitId } = useParams<{ chitId: string }>();
    const chit = MOCK_CHITS.find(c => c.id === parseInt(chitId || ''));

    const [isTxModalOpen, setTxModalOpen] = useState(false);
    const [isAddTxModalOpen, setAddTxModalOpen] = useState(false);
    const [isEditMemberModalOpen, setEditMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ChitMember | null>(null);

    const handleViewTransactions = (member: ChitMember) => {
        setSelectedMember(member);
        setTxModalOpen(true);
    };

    const handleAddTransaction = (member: ChitMember) => {
        setSelectedMember(member);
        setAddTxModalOpen(true);
    };
    
    const handleEditMember = (member: ChitMember) => {
        setSelectedMember(member);
        setEditMemberModalOpen(true);
    };

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
               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.lotteryStatus === 'Won' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{member.lotteryStatus}</span>
            </td>
            <td className="p-4 space-x-2">
                <button onClick={() => handleViewTransactions(member)} className="text-primary hover:underline">Details</button>
                <button onClick={() => handleEditMember(member)} className="text-yellow-600 hover:underline">Edit</button>
                <button onClick={() => handleAddTransaction(member)} className="text-blue-600 hover:underline">Add Tx</button>
            </td>
         </tr>
    );

    const memberTransactions = selectedMember ? MOCK_MEMBER_TRANSACTIONS[selectedMember.id] || [] : [];

    return (
        <div>
            <Link to="/chits" className="text-primary hover:underline mb-4 inline-block">← Back to All Chits</Link>
            <h1 className="text-3xl font-bold mb-2 text-textPrimary">Chit Details: {chit.name}</h1>
            <p className="text-lg text-textSecondary mb-6">Managing members for chit group.</p>
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-textPrimary">Members</h2>
                <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
                    + Add Member
                </button>
            </div>

            <Table headers={memberHeaders} data={MOCK_CHIT_MEMBERS} renderRow={renderMemberRow} />

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
                <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Date</label>
                        <input type="date" className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Description</label>
                        <input type="text" placeholder="e.g., August Installment" className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Amount</label>
                        <input type="number" className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Type</label>
                        <select className="w-full p-2 border rounded-md">
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
                 <form>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-textSecondary mb-1">Member Name</label>
                        <input type="text" className="w-full p-2 border rounded-md" defaultValue={selectedMember?.name} />
                    </div>
                    <div className="text-right">
                        <button type="button" onClick={() => setEditMemberModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Changes</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ChitDetailsPage;
