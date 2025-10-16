
import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConnect = () => {
    if (apiKey) {
      showNotification('Database connected successfully!', 'success');
    } else {
      showNotification('API Key is required to connect.', 'error');
    }
  };

  const handleBackup = () => {
    if (sheetsUrl) {
      showNotification('Data backup to Google Sheets initiated.', 'success');
    } else {
      showNotification('Google Sheets URL is required for backup.', 'error');
    }
  };

  const handleRestore = () => {
    if (sheetsUrl) {
      showNotification('Data restore from Google Sheets initiated.', 'success');
    } else {
      showNotification('Google Sheets URL is required for restore.', 'error');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-textPrimary">Settings</h1>

      {notification && (
        <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <div className="space-y-8">
        {/* Database Setup */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary border-b pb-2 mb-4">Database Setup</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-textSecondary mb-1">API Key for Database Connection</label>
              <input 
                type="text" 
                id="api-key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your database API key" 
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="sheets-url" className="block text-sm font-medium text-textSecondary mb-1">Google Sheets URL for Backup/Restore</label>
              <input 
                type="url" 
                id="sheets-url"
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..." 
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleConnect} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors">Connect Database</button>
              <button onClick={handleBackup} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">Backup Data</button>
              <button onClick={handleRestore} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors">Restore Data</button>
            </div>
          </div>
        </div>

        {/* Manage Account */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary border-b pb-2 mb-4">Manage Account</h2>
          <p className="text-textSecondary">Logged in as: <span className="font-medium text-textPrimary">demo_user@businesspro.com</span></p>
          <div className="mt-4">
            <button className="text-primary hover:underline">Change Password</button>
            <button className="ml-4 text-red-600 hover:underline">Logout</button>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary border-b pb-2 mb-4">App Preferences</h2>
          <div className="flex items-center">
            <label htmlFor="theme" className="mr-4 text-textSecondary">Theme:</label>
            <select id="theme" className="p-2 border border-gray-300 rounded-md">
              <option>Light</option>
              <option disabled>Dark (Coming Soon)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
