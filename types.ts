import React from 'react';

export interface NavItem {
  path: string;
  name: string;
  icon: React.ReactElement<{ className?: string }>;
}

// Corresponds to 'customers' table
export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  // Client-side calculated fields
  totalGiven: number;
  totalReceived: number;
}

// Corresponds to 'customer_transactions' table
export interface CustomerTransaction {
    id: number;
    customer_id: number;
    date: string;
    amount: number;
    description: string;
    type: 'Given' | 'Received';
}

// Corresponds to 'chits' table
export interface Chit {
  id: number;
  name: string;
  total_value: number;
  members_count: number;
  duration_months: number;
  status: 'Ongoing' | 'Completed';
  created_at: string;
  // Client-side calculated fields
  amountCollected: number;
  amountGiven: number;
}

// Corresponds to 'chit_members' table
export interface ChitMember {
  id: number;
  chit_id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  lottery_status: 'Pending' | 'Won';
  // Client-side calculated fields
  totalReceived: number;
  totalGiven: number;
  lastTx: string;
}

// Corresponds to 'chit_transactions' table
export interface ChitTransaction {
  id: number;
  member_id: number;
  date: string;
  amount: number;
  type: 'Given' | 'Received';
  description: string;
}

// Corresponds to 'expenses' table
export interface Expense {
    id: number;
    expense_date: string;
    description: string;
    category: string;
    amount: number;
    type: 'Income' | 'Expense';
}

// Corresponds to 'loans' table
export interface Loan {
    id: number;
    name: string;
    principal: number;
    interest_rate: number;
    duration_months: number;
    type: 'Taken' | 'Given';
    status: 'Active' | 'Paid Off';
    // Client-side calculated
    paid: number;
}

// Corresponds to 'loan_transactions' table
export interface LoanTransaction {
  id: number;
  loan_id: number;
  date: string;
  amount: number;
  description: string;
  type: 'Payment' | 'Disbursement';
}