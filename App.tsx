
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import DailyBusinessPage from './pages/DailyBusinessPage';
import ChitsPage from './pages/ChitsPage';
import HouseholdExpensesPage from './pages/HouseholdExpensesPage';
import LoansPage from './pages/LoansPage';
import SummaryReportPage from './pages/SummaryReportPage';
import SettingsPage from './pages/SettingsPage';
import ChitDetailsPage from './pages/ChitDetailsPage';
import LoginPage from './pages/LoginPage';

// This component checks if the user is authenticated.
// If not, it redirects to the login page.
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// This component defines the main layout with the sidebar.
const MainLayout: React.FC = () => (
  <div className="flex h-screen bg-background text-textPrimary">
    <Sidebar />
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/daily-business" element={<DailyBusinessPage />} />
              <Route path="/chits" element={<ChitsPage />} />
              <Route path="/chits/:chitId" element={<ChitDetailsPage />} />
              <Route path="/household-expenses" element={<HouseholdExpensesPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/summary-report" element={<SummaryReportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
