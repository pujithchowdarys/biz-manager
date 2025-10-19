import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LotteryDraw from '../components/LotteryDraw';
import { supabase } from '../supabaseClient';
import { Chit, ChitMember } from '../types';
import { EditIcon, TrashIcon } from '../constants';

const ChitsPage: React.FC = () => {
  const [chits, setChits] = useState<Chit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddChitModalOpen, setIsAddChitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLotteryModalOpen, setIsLotteryModalOpen] = useState(false);
  const [isLotteryDrawModalOpen, setIsLotteryDrawModalOpen] = useState(false);
  
  const [selectedChit, setSelectedChit] = useState<Chit | null>(null);
  const [eligibleMembers, setEligibleMembers] = useState<ChitMember[]>([]);
  const [selectedLotteryParticipants, setSelectedLotteryParticipants] = useState<ChitMember[]>([]);
  const [lotteryWinner, setLotteryWinner] = useState<ChitMember | null>(null);
  
  const [formState, setFormState] = useState<any>({});
  const [overview, setOverview] = useState({ totalCollected: 0, totalGiven: 0, totalSavings: 0 });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: chitsData, error: chitsError } = await supabase
        .from('chits')
        .select(`
            *,
            chit_members (
                chit_transactions (
                    type,
                    amount
                )
            )
        `)
        .order('name', { ascending: true });

      if (chitsError) throw chitsError;

      if (chitsData) {
        const chitsWithTotals = chitsData.map(chit => {
          let amountCollected = 0;
          let amountGiven = 0;

          const members = (chit.chit_members as any[]) || [];
          members.forEach(member => {
            const transactions = (member.chit_transactions as any[]) || [];
            transactions.forEach(tx => {
              if (tx.type === 'Given') {
                amountCollected += tx.amount;
              } else if (tx.type === 'Received') {
                amountGiven += tx.amount;
              }
            });
          });
          
          const { chit_members, ...restOfChit } = chit;
          return { ...restOfChit, amountCollected, amountGiven };
        });
        
        setChits(chitsWithTotals as Chit[]);

        const totalCollected = chitsWithTotals.reduce((sum, c) => sum + c.amountCollected, 0);
        const totalGiven = chitsWithTotals.reduce((sum, c) => sum + c.amountGiven, 0);
        setOverview({
            totalCollected,
            totalGiven,
            totalSavings: totalCollected - totalGiven,
        });
      }
    } catch (error: any) {
        console.error("Error fetching chits data:", error.message || error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (modalSetter: React.Dispatch<React.SetStateAction<boolean>>, chit: Chit | null = null, initialFormState = {}) => {
    setSelectedChit(chit);
    setFormState(initialFormState);
    modalSetter(true);
  };
  
  const handleAddChit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('chits').insert([{
        name: formState.name,
        total_value: parseFloat(formState.total_value),
        members_count: parseInt(formState.members_count),
        duration_months: parseInt(formState.duration_months),
        status: 'Ongoing'
    }]);
    if (error) console.error(error);
    else {
        setIsAddChitModalOpen(false);
        fetchData();
    }
  };

  const handleUpdateChit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChit) return;
    const { error } = await supabase.from('chits').update({
        name: formState.name,
        total_value: parseFloat(formState.total_value),
        members_count: parseInt(formState.members_count),
        duration_months: parseInt(formState.duration_months),
    }).eq('id', selectedChit.id);

    if (error) console.error(error);
    else {
        setIsEditModalOpen(false);
        fetchData();
    }
  };
  
  const handleDeleteChit = async (chitId: number) => {
    if (window.confirm('Are you sure you want to delete this chit group? This will delete all members and transactions associated with it.')) {
        const { data: members, error: membersError } = await supabase.from('chit_members').select('id').eq('chit_id', chitId);
        if (membersError) { 
            console.error(membersError);
            showNotification(`Error fetching members: ${membersError.message}`, 'error');
            return; 
        }

        if (members && members.length > 0) {
            const memberIds = members.map(m => m.id);
            await supabase.from('chit_transactions').delete().in('member_id', memberIds);
            await supabase.from('chit_members').delete().in('id', memberIds);
        }
        
        const { error: chitError } = await supabase.from('chits').delete().eq('id', chitId);
        if (chitError) {
            console.error(chitError);
            showNotification(`Error deleting chit: ${chitError.message}`, 'error');
        } else {
            showNotification('Chit group deleted successfully!', 'success');
            fetchData();
        }
    }
  };

  const handleOpenLotteryModal = async (chit: Chit) => {
    setSelectedChit(chit);
    const { data, error } = await supabase
        .from('chit_members')
        .select('*')
        .eq('chit_id', chit.id)
        .eq('lottery_status', 'Pending');
    
    if (error) {
        console.error(error);
    } else {
        const members = (data as ChitMember[]) || [];
        setEligibleMembers(members);
        setSelectedLotteryParticipants(members); // Select all by default
        setIsLotteryModalOpen(true);
    }
  };

  const handleLotterySelectionChange = (memberId: number) => {
    setSelectedLotteryParticipants(prev => {
        const isSelected = prev.some(p => p.id === memberId);
        if (isSelected) {
            return prev.filter(p => p.id !== memberId);
        } else {
            const memberToAdd = eligibleMembers.find(m => m.id === memberId);
            return memberToAdd ? [...prev, memberToAdd] : prev;
        }
    });
  };

  const handleSelectAllLottery = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedLotteryParticipants(eligibleMembers);
    } else {
        setSelectedLotteryParticipants([]);
    }
  };

  const handleStartDraw = () => {
    if (selectedLotteryParticipants.length < 2) {
        showNotification('Please select at least two members for the draw.', 'error');
        return;
    }
    setIsLotteryModalOpen(false);
    setLotteryWinner(null);
    setIsLotteryDrawModalOpen(true);
  };

  const handleConfirmWinner = async () => {
    if (!selectedChit || !lotteryWinner) return;
    await supabase.from('chit_members').update({ lottery_status: 'Won' }).eq('id', lotteryWinner.id);
    await supabase.from('chit_transactions').insert([{
        member_id: lotteryWinner.id,
        date: new Date().toISOString().split('T')[0],
        amount: selectedChit.total_value,
        type: 'Received',
        description: 'Lottery Prize'
    }]);
    
    showNotification(`${lotteryWinner.name} has won the lottery!`, 'success');
    setIsLotteryDrawModalOpen(false);
    setLotteryWinner(null);
    fetchData();
  };

  const tableHeaders = ['Chit Name', 'Total Value', 'Members', 'Collected', 'Given', 'Savings', 'Status', 'Actions'];

  const filteredChits = chits.filter(chit =>
    chit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderChitRow = (chit: Chit) => (
    <tr key={chit.id} className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium text-textPrimary">
        {chit.name}
        <div className="md:hidden mt-2 space-x-2">
            <button onClick={() => navigate(`/chits/${chit.id}`)} className="text-primary hover:underline text-sm">Details</button>
            <button onClick={() => handleOpenLotteryModal(chit)} className="text-secondary hover:underline text-sm">Lottery</button>
            <button onClick={() => handleOpenModal(setIsEditModalOpen, chit, { ...chit })} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"><EditIcon className="h-4 w-4" /></button>
            <button onClick={() => handleDeleteChit(chit.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="h-4 w-4" /></button>
        </div>
      </td>
      <td className="p-4 text-textPrimary">₹{chit.total_value.toLocaleString()}</td>
      <td className="p-4 text-textPrimary">{chit.members_count}</td>
      <td className="p-4 text-green-600">₹{chit.amountCollected.toLocaleString()}</td>
      <td className="p-4 text-red-600">₹{chit.amountGiven.toLocaleString()}</td>
      <td className="p-4 font-semibold text-blue-700">₹{(chit.amountCollected - chit.amountGiven).toLocaleString()}</td>
      <td className="p-4">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${chit.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {chit.status}
        </span>
      </td>
      <td className="p-4 space-x-2 whitespace-nowrap hidden md:table-cell">
        <button onClick={() => navigate(`/chits/${chit.id}`)} className="text-primary hover:underline">Details</button>
        <button onClick={() => handleOpenLotteryModal(chit)} className="text-secondary hover:underline">Lottery</button>
        <button onClick={() => handleOpenModal(setIsEditModalOpen, chit, { ...chit })} className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-full"><EditIcon /></button>
        <button onClick={() => handleDeleteChit(chit.id)} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon /></button>
      </td>
    </tr>
  );
  
  const formInputStyle = "w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-textPrimary">Chits Management</h1>
      {notification && (
        <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Chits" value={loading ? '...' : chits.filter(c => c.status === 'Ongoing').length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-yellow-500" />
        <StatCard title="Total Collected" value={loading ? '₹...' : `₹${overview.totalCollected.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} color="bg-green-500" />
        <StatCard title="Total Given" value={loading ? '₹...' : `₹${overview.totalGiven.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 15s-2 2-5 2-5-2-5-2" /></svg>} color="bg-red-500" />
        <StatCard title="Total Savings" value={loading ? '₹...' : `₹${overview.totalSavings.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} color="bg-blue-500" />
      </div>

      <div className="bg-surface p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <h2 className="text-2xl font-semibold text-textPrimary">Chit Groups</h2>
              <div className="flex-grow max-w-md">
                   <input
                      type="text"
                      placeholder="Search chits..."
                      className="w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <button onClick={() => handleOpenModal(setIsAddChitModalOpen, null)} className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap">+ Add Chit</button>
          </div>
      </div>

      {loading ? <p>Loading...</p> : <Table headers={tableHeaders} data={filteredChits} renderRow={renderChitRow} />}

      {/* Lottery Setup Modal */}
      <Modal isOpen={isLotteryModalOpen} onClose={() => setIsLotteryModalOpen(false)} title={`Lottery Setup for ${selectedChit?.name}`}>
        <h3 className="text-lg font-medium text-textPrimary mb-2">Select Participants</h3>
        <p className="text-sm text-textSecondary mb-4">Choose which eligible members will enter this lottery draw.</p>
        
        {eligibleMembers.length > 0 ? (
          <>
            <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                        type="checkbox"
                        checked={eligibleMembers.length > 0 && selectedLotteryParticipants.length === eligibleMembers.length}
                        onChange={handleSelectAllLottery}
                        className="h-5 w-5 rounded text-primary focus:ring-primary"
                    />
                    <span>Select All / Deselect All</span>
                </label>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto mb-6 p-2 border rounded-md bg-gray-50">
              {eligibleMembers.map(member => (
                <li key={member.id} className="p-2 rounded-md hover:bg-gray-100">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={selectedLotteryParticipants.some(p => p.id === member.id)}
                            onChange={() => handleLotterySelectionChange(member.id)}
                            className="h-5 w-5 rounded text-primary focus:ring-primary"
                        />
                        <span className="font-medium">{member.name}</span>
                    </label>
                </li>
              ))}
            </ul>
            <div className="text-right">
                <button 
                    onClick={handleStartDraw} 
                    disabled={selectedLotteryParticipants.length < 2}
                    className="px-6 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Start Draw ({selectedLotteryParticipants.length})
                </button>
            </div>
          </>
        ) : (
          <p>No eligible members remaining for the lottery.</p>
        )}
      </Modal>

      {/* Lottery Draw Modal */}
      <Modal isOpen={isLotteryDrawModalOpen} onClose={() => setIsLotteryDrawModalOpen(false)} title="Lottery In Progress...">
        {isLotteryDrawModalOpen && selectedLotteryParticipants.length > 0 && (
            <LotteryDraw 
                participants={selectedLotteryParticipants}
                onWinnerSelected={(winner) => setLotteryWinner(winner)}
            />
        )}
        <div className="text-center mt-4">
            <button 
                onClick={handleConfirmWinner}
                disabled={!lotteryWinner}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Confirm Winner
            </button>
        </div>
      </Modal>

      {/* Edit Chit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Chit: ${selectedChit?.name}`}>
          <form onSubmit={handleUpdateChit}>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-textSecondary mb-1">Chit Name</label>
                  <input type="text" name="name" className={formInputStyle} value={formState.name || ''} onChange={handleFormChange} required/>
              </div>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-textSecondary mb-1">Chit Value (₹)</label>
                  <input type="number" name="total_value" className={formInputStyle} value={formState.total_value || ''} onChange={handleFormChange} required/>
              </div>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-textSecondary mb-1">Number of Members</label>
                  <input type="number" name="members_count" className={formInputStyle} value={formState.members_count || ''} onChange={handleFormChange} required/>
              </div>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-textSecondary mb-1">Duration (months)</label>
                  <input type="number" name="duration_months" className={formInputStyle} value={formState.duration_months || ''} onChange={handleFormChange} required/>
              </div>
              <div className="text-right">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">Save Changes</button>
              </div>
          </form>
      </Modal>

       {/* Add Chit Modal */}
       <Modal isOpen={isAddChitModalOpen} onClose={() => setIsAddChitModalOpen(false)} title="Add New Chit">
          <form onSubmit={handleAddChit}>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-textSecondary mb-1">Chit Name</label>
                  <input type="text" name="name" className={formInputStyle} placeholder="e.g., Monthly Savings Group" onChange={handleFormChange} required/>
              </div>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-textSecondary mb-1">Chit Value (₹)</label>
                  <input type="number" name="total_value" className={formInputStyle} placeholder="e.g., 50000" onChange={handleFormChange} required/>
              </div>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-textSecondary mb-1">Number of Members</label>
                  <input type="number" name="members_count" className={formInputStyle} placeholder="e.g., 10" onChange={handleFormChange} required/>
              </div>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-textSecondary mb-1">Duration (months)</label>
                  <input type="number" name="duration_months" className={formInputStyle} placeholder="e.g., 10" onChange={handleFormChange} required/>
              </div>
              <div className="text-right">
                  <button type="button" onClick={() => setIsAddChitModalOpen(false)} className="px-4 py-2 mr-2 bg-gray-200 rounded-md">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover">Create Chit</button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default ChitsPage;