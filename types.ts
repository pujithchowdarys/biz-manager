import React from 'react';

export interface NavItem {
  path: string;
  name: string;
  // Fix: Changed JSX.Element to React.ReactElement to explicitly use the React namespace.
  icon: React.ReactElement;
}

export interface Customer {
  id: number;
  name: string;
  totalGiven: number;
  totalReceived: number;
  status: 'Active' | 'Inactive';
}

export interface Chit {
  id: number;
  name: string;
  totalValue: number;
  membersCount: number;
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
    paid: number;
    type: 'Taken' | 'Given';
    status: 'Active' | 'Paid Off';
}