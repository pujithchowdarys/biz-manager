import React from 'react';

export interface NavItem {
  path: string;
  name: string;
  // Fix: Explicitly type the 'icon' prop to accept a 'className'. This allows cloning the element with new styles.
  icon: React.ReactElement<{ className?: string }>;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  totalGiven: number;
  totalReceived: number;
  status: 'Active' | 'Inactive';
}

export interface Chit {
  id: number;
  name: string;
  totalValue: number;
  membersCount: number;
  duration: number; // in months
  amountCollected: number;
  amountGiven: number;
  status: 'Ongoing' | 'Completed';
}

export interface Expense {
    id: number;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'Income' | 'Expense';
}

export interface Loan {
    id: number;
    name: string;
    principal: number;
    interestRate: number;
    duration: number; // in months
    paid: number;
    type: 'Taken' | 'Given';
    status: 'Active' | 'Paid Off';
}

export interface LoanTransaction {
  id: number;
  date: string;
  amount: number;
  description: string;
  type: 'Payment' | 'Disbursement';
}

export interface MemberTransaction {
  id: number;
  date: string;
  amount: number;
  type: 'Given' | 'Received';
  description: string;
}

export interface ChitMember {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalReceived: number;
  totalGiven: number;
  lastTx: string;
  lotteryStatus: 'Pending' | 'Won';
}