import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { supabase } from '../supabaseClient';
import { Chit } from '../types';

const ChitsPage: React.FC = () => {
  const [chits, setChits] = useState<Chit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddChitModalOpen, setIsAddChitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChit, setSelectedChit] = useState<Chit | null>(null);
  const [formState, setFormState] = useState<any>({});
  const [overview, setOverview] = useState({ totalCollected: 0, totalGiven: 0, totalSavings: 0 });
  const navigate = useNavigate();

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


  const tableHeaders = ['Chit Name', 'Total Value', 'Members', 'Collected', 'Given', 'Savings', 'Status', 'Actions'];

  const renderChitRow = (chit: Chit) => (
    <tr key={chit.id} className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium text-textPrimary">{chit.name}</td>
      <td className="p-4">₹{chit.total_value.toLocaleString()}</td>
      <td className="p-4">{chit.members_count}</td>
      <td className="p-4 text-green-600">₹{chit.amountCollected.toLocaleString()}</td>
      <td className="p-4 text-red-600">₹{chit.amountGiven.toLocaleString()}</td>
      <td className="p-4 font-semibold text-blue-700">₹{(chit.amountCollected - chit.amountGiven).toLocaleString()}</td>
      <td className="p-4">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${chit.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {chit.status}
        </span>
      </td>
      <td className="p-4 space-x-2">
        <button onClick={() => navigate(`/chits/${chit.id}`)} className="text-primary hover:underline">Details</button>
        <button onClick={() => handleOpenModal(setIsEditModalOpen, chit, { ...chit })} className="text-yellow-600 hover:underline">Edit</button>
        <button className="text-secondary hover:underline disabled:text-gray-400" disabled>Lottery</button>
      </td>
    </tr>
  );
  
  const formInputStyle = "w-full p-2 border rounded-md bg-white text-textPrimary focus:ring-primary focus:border-primary";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-textPrimary">Chits Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Chits" value={loading ? '...' : chits.filter(c => c.status === 'Ongoing').length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-yellow-500" />
        <StatCard title="Total Collected" value={loading ? '₹...' : `₹${overview.totalCollected.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} color="bg-green-500" />
        <StatCard title="Total Given" value={loading ? '₹...' : `₹${overview.totalGiven.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 15s-2 2-5 2-5-2-5-2" /></svg>} color="bg-red-500" />
        <StatCard title="Total Savings" value={loading ? '₹...' : `₹${overview.totalSavings.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} color="bg-blue-500" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-textPrimary">Chit Groups</h2>
        <button onClick={() => handleOpenModal(setIsAddChitModalOpen, null)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">+ Add Chit</button>
      </div>

      {loading ? <p>Loading...</p> : <Table headers={tableHeaders} data={chits} renderRow={renderChitRow} />}

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
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Save Changes</button>
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
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Create Chit</button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default ChitsPage;