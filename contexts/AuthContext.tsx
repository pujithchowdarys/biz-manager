import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { createSupabaseClient } from '../supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';

// This interface now represents the stored data for one account
interface UserAccount {
  password: string;
  supabaseUrl: string;
  supabaseKey: string;
}

// This will be the structure of our stored accounts object
interface StoredAccounts {
    [username: string]: UserAccount;
}

interface AuthContextType {
  isAuthenticated: boolean;
  supabase: SupabaseClient | null;
  login: (user: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  signup: (user: string, pass: string, url: string, key: string) => Promise<{ success: boolean; message: string }>;
  getSupabaseUrl: () => string | null;
}

export const AuthContext = createContext<AuthContextType>(null!);

const ACCOUNTS_STORAGE_KEY = 'bizManagerAccounts';
const CURRENT_USER_STORAGE_KEY = 'bizManagerCurrentUser';

// Helper to safely get accounts from localStorage
const getStoredAccounts = (): StoredAccounts => {
    try {
        const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        console.error("Failed to parse accounts from localStorage", e);
        // If parsing fails, return an empty object to prevent app crash
        return {};
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [currentUserAccount, setCurrentUserAccount] = useState<UserAccount | null>(null);

  // Effect to check for a logged-in user on app start (session persistence)
  useEffect(() => {
    const currentUsername = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (currentUsername) {
        const accounts = getStoredAccounts();
        const account = accounts[currentUsername];
        if (account) {
            try {
                setSupabase(createSupabaseClient(account.supabaseUrl, account.supabaseKey));
                setCurrentUserAccount(account);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to initialize Supabase for stored user", error);
                // Clear bad state if Supabase client creation fails
                localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
            }
        }
    }
  }, []);
  
  const signup = async (user: string, pass: string, url: string, key: string): Promise<{ success: boolean; message: string }> => {
      const accounts = getStoredAccounts();
      if (accounts[user]) {
          return { success: false, message: 'Username already exists. Please choose another one or log in.' };
      }
      
      try {
        const testClient = createSupabaseClient(url, key);
        // Test connection by fetching a single row
        const { error } = await testClient.from('customers').select('id').limit(1);
        if (error) {
             throw new Error(`Could not connect to Supabase. Check your URL, key, and ensure the 'customers' table exists as per the instructions. Details: ${error.message}`);
        }

        // Connection is good, save the new account
        const newAccount: UserAccount = { password: pass, supabaseUrl: url, supabaseKey: key };
        accounts[user] = newAccount;
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
        
        // Automatically log the user in after successful signup
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, user);
        setSupabase(testClient);
        setCurrentUserAccount(newAccount);
        setIsAuthenticated(true);

        return { success: true, message: 'Signup successful!' };

      } catch (error: any) {
        console.error("Signup failed:", error);
        return { success: false, message: error.message || 'An unexpected error occurred during signup.' };
      }
  };

  const login = async (user: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const accounts = getStoredAccounts();
    const account = accounts[user];

    if (!account || account.password !== pass) {
        return { success: false, message: 'Invalid username or password.' };
    }

    try {
        const testClient = createSupabaseClient(account.supabaseUrl, account.supabaseKey);
        const { error } = await testClient.from('customers').select('id').limit(1);
        if (error) {
            if (error.message.includes('fetch')) {
                return { success: false, message: 'Connection failed. Check your Supabase URL.' };
            } else if (error.message.includes('Invalid API key')) {
                return { success: false, message: 'Invalid Supabase Anon Key.' };
            }
            return { success: false, message: `Database error: ${error.message}. Please ensure tables are set up correctly.` };
        }
        
        // Login successful
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, user);
        setSupabase(testClient);
        setCurrentUserAccount(account);
        setIsAuthenticated(true);
        return { success: true, message: 'Login successful!' };
    } catch (e: any) {
        return { success: false, message: `An unexpected error occurred: ${e.message}` };
    }
  };

  const logout = () => {
    // Remove only the current user session, not all accounts
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setSupabase(null);
    setCurrentUserAccount(null);
    setIsAuthenticated(false);
  };
  
  const getSupabaseUrl = (): string | null => {
    return currentUserAccount ? currentUserAccount.supabaseUrl : null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, supabase, login, logout, signup, getSupabaseUrl }}>
      {children}
    </AuthContext.Provider>
  );
};