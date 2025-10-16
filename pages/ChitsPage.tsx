
import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { MOCK_CHITS, MOCK_CHIT_MEMBERS } from '../constants';
import { Chit } from '../types';

const ChitsPage: React.FC = () => {
  const [chits] = useState<Chit[]>(MOCK_CHITS);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isLotteryModalOpen, setLotteryModalOpen] = useState(false);
  const [selectedChit, setSelectedChit] = useState<Chit | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const handleViewDetails = (chit: Chit) => {
    setSelectedChit(chit);
    setDetailModalOpen(true);
  };

  const handleLottery = (chit: Chit) => {
    setSelectedChit(chit);
    setLotteryModalOpen(true);
    setWinner(null);
  };

  const runLottery = () => {
    setSpinning(true);
    setWinner(null);
    const potentialWinners = MOCK_CHIT_MEMBERS.filter(m => m.lotteryStatus === 'Pending');
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * potentialWinners.length);
        setWinner(potentialWinners[randomIndex].name);
        setSpinning(false);
    }, 3000);
  };

  const tableHeaders = ['Chit Name', 'Total Value', 'Members', 'Collected', 'Given', 'Savings', 'Status', 'Actions'];

  const renderChitRow = (chit: Chit) => (
    <tr key={chit.id} className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium text-textPrimary">{chit.name}</td>
      <td className="p-4">₹{chit.totalValue.toLocaleString()}</td>
      <td className="p-4">{chit.membersCount}</td>
      <td className="p-4 text-green-600">₹{chit.amountCollected.toLocaleString()}</td>
      <td className="p-4 text-red-600">₹{chit.amountGiven.toLocaleString()}</td>
      <td className="p-4 font-semibold text-blue-700">₹{(chit.amountCollected - chit.amountGiven).toLocaleString()}</td>
      <td className="p-4">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${chit.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {chit.status}
        </span>
      </td>
      <td className="p-4 space-x-2">
        <button onClick={() => handleViewDetails(chit)} className="text-primary hover:underline">Details</button>
        <button onClick={() => handleLottery(chit)} className="text-secondary hover:underline">Lottery</button>
      </td>
    </tr>
  );
  
  const memberHeaders = ['Member Name', 'Total Received', 'Total Given', 'Last Transaction', 'Lottery Status'];
  
  const renderMemberRow = (member: typeof MOCK_CHIT_MEMBERS[0]) => (
     <tr key={member.id} className="border-b hover:bg-gray-50">
        <td className="p-4 font-medium text-textPrimary">{member.name}</td>
        <td className="p-4 text-green-600">₹{member.totalReceived.toLocaleString()}</td>
        <td className="p-4 text-red-600">₹{member.totalGiven.toLocaleString()}</td>
        <td className="p-4">{member.lastTx}</td>
        <td className="p-4">
           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.lotteryStatus === 'Won' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{member.lotteryStatus}</span>
        </td>
     </tr>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-textPrimary">Chits Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Chits" value={chits.filter(c => c.status === 'Ongoing').length.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-yellow-500" />
        <StatCard title="Total Collected" value={`₹${chits.reduce((s, c) => s + c.amountCollected, 0).toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} color="bg-green-500" />
        <StatCard title="Total Given" value={`₹${chits.reduce((s, c) => s + c.amountGiven, 0).toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 15s-2 2-5 2-5-2-5-2" /></svg>} color="bg-red-500" />
        <StatCard title="Total Savings" value={`₹${chits.reduce((s, c) => s + (c.amountCollected - c.amountGiven), 0).toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} color="bg-blue-500" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-textPrimary">Chit Groups</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">+ Add Chit</button>
      </div>

      <Table headers={tableHeaders} data={chits} renderRow={renderChitRow} />
      
      <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Members of ${selectedChit?.name}`}>
        <Table headers={memberHeaders} data={MOCK_CHIT_MEMBERS} renderRow={renderMemberRow}/>
      </Modal>

      <Modal isOpen={isLotteryModalOpen} onClose={() => setLotteryModalOpen(false)} title={`Lottery for ${selectedChit?.name}`}>
        <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Spin the wheel to select a winner!</h3>
            <div className="relative w-48 h-48 mx-auto border-4 border-primary rounded-full flex items-center justify-center mb-4">
                {spinning ? (
                     <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary"></div>
                ) : (
                    <span className="text-2xl font-bold text-primary">{winner ? winner : '?'}</span>
                )}
            </div>
            {winner && !spinning && <p className="text-xl font-bold text-green-600 my-4">Congratulations {winner}!</p>}
            <button onClick={runLottery} disabled={spinning} className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400">
                {spinning ? 'Spinning...' : 'Spin'}
            </button>
        </div>
      </Modal>
    </div>
  );
};

export default ChitsPage;
