
import React from 'react';
import { NavItem, Customer, Chit, Expense, Loan, ChitMember, MemberTransaction } from './types';

// Icons
// Fix: Update icon components to accept props, allowing className to be passed via React.cloneElement.
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BusinessIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ChitsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ExpensesIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 4h.01M18 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LoansIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5l-2.5 2.5M15 12l2.5 2.5" /></svg>;
const ReportIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export const NAV_ITEMS: NavItem[] = [
  { path: '/', name: 'Home', icon: <HomeIcon /> },
  { path: '/daily-business', name: 'Daily Business', icon: <BusinessIcon /> },
  { path: '/chits', name: 'Chits', icon: <ChitsIcon /> },
  { path: '/household-expenses', name: 'Household Expenses', icon: <ExpensesIcon /> },
  { path: '/loans', name: 'Loans', icon: <LoansIcon /> },
  { path: '/summary-report', name: 'Summary Report', icon: <ReportIcon /> },
  { path: '/settings', name: 'Settings', icon: <SettingsIcon /> },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 1, name: 'Ramesh Kumar', totalGiven: 15000, totalReceived: 12000, status: 'Active' },
    { id: 2, name: 'Sunita Devi', totalGiven: 8000, totalReceived: 8000, status: 'Active' },
    { id: 3, name: 'Anil Singh', totalGiven: 20000, totalReceived: 15500, status: 'Active' },
    { id: 4, name: 'Priya Sharma', totalGiven: 0, totalReceived: 0, status: 'Inactive' },
];

export const MOCK_CHITS: Chit[] = [
    { id: 1, name: 'Friends Chit', totalValue: 100000, membersCount: 10, amountCollected: 80000, amountGiven: 70000, status: 'Ongoing' },
    { id: 2, name: 'Family Group', totalValue: 50000, membersCount: 5, amountCollected: 45000, amountGiven: 40000, status: 'Ongoing' },
    { id: 3, name: 'Office Chit', totalValue: 200000, membersCount: 20, amountCollected: 200000, amountGiven: 200000, status: 'Completed' },
];

export const MOCK_CHIT_MEMBERS: ChitMember[] = [
    { id: 1, name: 'Amit', totalReceived: 0, totalGiven: 8000, lastTx: '2024-07-15', lotteryStatus: 'Pending' },
    { id: 2, name: 'Bhavna', totalReceived: 10000, totalGiven: 8000, lastTx: '2024-06-20', lotteryStatus: 'Won' },
    { id: 3, name: 'Chetan', totalReceived: 0, totalGiven: 8000, lastTx: '2024-07-15', lotteryStatus: 'Pending' },
    { id: 4, name: 'Divya', totalReceived: 0, totalGiven: 8000, lastTx: '2024-07-15', lotteryStatus: 'Pending' },
];

export const MOCK_MEMBER_TRANSACTIONS: { [memberId: number]: MemberTransaction[] } = {
    1: [ // Amit's transactions
        { id: 1, date: '2024-07-15', amount: 4000, type: 'Given', description: 'July Installment' },
        { id: 2, date: '2024-06-15', amount: 4000, type: 'Given', description: 'June Installment' },
    ],
    2: [ // Bhavna's transactions
        { id: 3, date: '2024-06-20', amount: 10000, type: 'Received', description: 'Lottery Win' },
        { id: 4, date: '2024-07-15', amount: 4000, type: 'Given', description: 'July Installment' },
        { id: 5, date: '2024-06-15', amount: 4000, type: 'Given', description: 'June Installment' },
    ],
    3: [],
    4: [],
};


export const MOCK_EXPENSES: Expense[] = [
    { id: 1, date: '2024-07-22', description: 'Salary', category: 'Income', amount: 25000, type: 'Income' },
    { id: 2, date: '2024-07-21', description: 'Groceries', category: 'Food', amount: 4500, type: 'Expense' },
    { id: 3, date: '2024-07-20', description: 'Electricity Bill', category: 'Utilities', amount: 1260, type: 'Expense' },
    { id: 4, date: '2024-07-18', description: 'Rent', category: 'Housing', amount: 10000, type: 'Expense' },
    { id: 5, date: '2024-07-15', description: 'Internet Bill', category: 'Utilities', amount: 800, type: 'Expense' },
    { id: 6, date: '2024-07-12', description: 'Dinner Out', category: 'Entertainment', amount: 2000, type: 'Expense' },
];

export const MOCK_LOANS: Loan[] = [
    { id: 1, name: 'Home Loan', principal: 50000, paid: 20000, type: 'Taken', status: 'Active' },
    { id: 2, name: 'Loan to Friend', principal: 25000, paid: 10000, type: 'Given', status: 'Active' },
    { id: 3, name: 'Car Loan', principal: 10000, paid: 10000, type: 'Taken', status: 'Paid Off' },
];

export const SUMMARY_DATA = {
    business: { totalGiven: 43000, totalReceived: 35500, balance: 7500 },
    chits: { totalValue: 150000, amountCollected: 125000, amountGiven: 110000, savings: 15000 },
    household: { totalIncome: 25000, totalExpenses: 18560, net: 6440 },
    loans: { totalTaken: 50000, totalGiven: 25000, balanceToPay: 30000, balanceToReceive: 15000 }
};