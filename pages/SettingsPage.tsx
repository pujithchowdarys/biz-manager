import React, { useState } from 'react';
import { supabaseUrl } from '../supabaseClient';

const SettingsPage: React.FC = () => {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(supabaseUrl);
    showNotification('Supabase URL copied to clipboard!', 'success');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-textPrimary">Settings</h1>

      {notification && (
        <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <div className="space-y-8">
        {/* Database Info */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary border-b pb-2 mb-4">Database Connection</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-textSecondary mb-1">Supabase Project URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  id="api-key" 
                  value={supabaseUrl}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                />
                <button onClick={handleCopy} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors">Copy</button>
              </div>
               <p className="text-xs text-textSecondary mt-2">
                 Your application is connected to this Supabase project. Connection details are managed in the `supabaseClient.ts` file.
               </p>
            </div>
          </div>
        </div>

        {/* Manage Account */}
        <div className="bg-surface p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary border-b pb-2 mb-4">Manage Account</h2>
          <p className="text-textSecondary">This feature requires Supabase Auth to be implemented.</p>
          <div className="mt-4">
            <button className="text-primary hover:underline" disabled>Change Password</button>
            <button className="ml-4 text-red-600 hover:underline" disabled>Logout</button>
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