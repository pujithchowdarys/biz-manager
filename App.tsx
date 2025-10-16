
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import DailyBusinessPage from './pages/DailyBusinessPage';
import ChitsPage from './pages/ChitsPage';
import HouseholdExpensesPage from './pages/HouseholdExpensesPage';
import LoansPage from './pages/LoansPage';
import SummaryReportPage from './pages/SummaryReportPage';
import SettingsPage from './pages/SettingsPage';
import ChitDetailsPage from './pages/ChitDetailsPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex h-screen bg-background text-textPrimary">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/daily-business" element={<DailyBusinessPage />} />
            <Route path="/chits" element={<ChitsPage />} />
            <Route path="/chits/:chitId" element={<ChitDetailsPage />} />
            <Route path="/household-expenses" element={<HouseholdExpensesPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/summary-report" element={<SummaryReportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;