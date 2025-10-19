
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { logout, getSupabaseUrl, theme, setTheme } = useContext(AuthContext);
  const supabaseUrl = getSupabaseUrl();

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = () => {
    if (supabaseUrl) {
      navigator.clipboard.writeText(supabaseUrl);
      showNotification('Supabase URL copied to clipboard!', 'success');
    }
  }

  const handleLogout = () => {
    logout();
    // The ProtectedRoute component will handle redirecting to the login page.
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-textPrimary">Settings</h1>

      {notification && (
        <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-pill-success-bg text-pill-success-text' : 'bg-pill-danger-bg text-pill-danger-text'}`}>
          {notification.message}
        </div>
      )}

      <div className="space-y-8">
        {/* Database Info */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary border-b border-border pb-2 mb-4">Database Connection</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-textSecondary mb-1">Your Supabase Project URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="api-key" 
                  value={supabaseUrl || 'Not configured'}
                  readOnly
                  className="w-full p-2 border border-border rounded-md shadow-sm bg-surface"
                />
                <button onClick={handleCopy} disabled={!supabaseUrl} className="bg-primary-light text-primary font-semibold px-4 py-2 rounded-md hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed">Copy</button>
              </div>
               <p className="text-xs text-textSecondary mt-2">
                 This is the Supabase project your application is currently connected to.
               </p>
            </div>
          </div>
        </div>

        {/* Manage Account */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary border-b border-border pb-2 mb-4">Manage Account</h2>
          <p className="text-textSecondary">You can log out to connect to a different database or account.</p>
          <div className="mt-4">
            <button onClick={handleLogout} className="text-danger hover:underline">Logout</button>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary border-b border-border pb-2 mb-4">App Preferences</h2>
          <div className="flex items-center">
            <label htmlFor="theme" className="mr-4 text-textSecondary">Theme:</label>
            <select
                id="theme"
                className="p-2 border border-border rounded-md bg-surface text-textPrimary"
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;