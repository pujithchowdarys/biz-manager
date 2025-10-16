import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../supabaseClient';

interface SummaryData {
    business: { totalGiven: number, totalReceived: number, balance: number },
    chits: { totalValue: number, amountCollected: number, amountGiven: number, savings: number },
    household: { totalIncome: number, totalExpenses: number, net: number },
    loans: { totalTaken: number, totalGiven: number, balanceToPay: number, balanceToReceive: number }
}

const SummaryReportPage: React.FC = () => {
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSummaryData = useCallback(async () => {
        setLoading(true);
        // In a real app, these complex aggregations should be done in the database with RPC functions
        // For simplicity, we are doing them on the client here.
        
        try {
            // Fetch all necessary data
            const [
                { data: customersTxs },
                { data: chitsData },
                { data: expensesData },
                { data: loansData },
                { data: loanTxs },
            ] = await Promise.all([
                supabase.from('customer_transactions').select('type, amount'),
                supabase.from('chits').select('total_value'), // Simplified chits summary
                supabase.from('expenses').select('type, amount'),
                supabase.from('loans').select('type, principal'),
                supabase.from('loan_transactions').select('loan_id, type, amount'),
            ]);

            const newSummary: SummaryData = {
                business: { totalGiven: 0, totalReceived: 0, balance: 0 },
                chits: { totalValue: 0, amountCollected: 0, amountGiven: 0, savings: 0 },
                household: { totalIncome: 0, totalExpenses: 0, net: 0 },
                loans: { totalTaken: 0, totalGiven: 0, balanceToPay: 0, balanceToReceive: 0 }
            };

            // Business Summary
            customersTxs?.forEach(tx => {
                if (tx.type === 'Given') newSummary.business.totalGiven += tx.amount;
                if (tx.type === 'Received') newSummary.business.totalReceived += tx.amount;
            });
            newSummary.business.balance = newSummary.business.totalGiven - newSummary.business.totalReceived;

            // Household Summary
            expensesData?.forEach(ex => {
                if (ex.type === 'Income') newSummary.household.totalIncome += ex.amount;
                if (ex.type === 'Expense') newSummary.household.totalExpenses += ex.amount;
            });
            newSummary.household.net = newSummary.household.totalIncome - newSummary.household.totalExpenses;

            // Loans Summary
            const loansWithPaid = loansData?.map(loan => {
                const paid = loanTxs?.filter(tx => tx.loan_id === loan.id && tx.type === 'Payment').reduce((sum, tx) => sum + tx.amount, 0) || 0;
                return { ...loan, paid };
            });

            loansWithPaid?.forEach(loan => {
                if(loan.type === 'Taken') {
                    newSummary.loans.totalTaken += loan.principal;
                    newSummary.loans.balanceToPay += (loan.principal - loan.paid);
                }
                if(loan.type === 'Given') {
                    newSummary.loans.totalGiven += loan.principal;
                    newSummary.loans.balanceToReceive += (loan.principal - loan.paid);
                }
            });
            
             // Chits Summary (Simplified)
            newSummary.chits.totalValue = chitsData?.reduce((sum, c) => sum + c.total_value, 0) || 0;


            setSummaryData(newSummary);

        } catch (error) {
            console.error("Error fetching summary data", error);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSummaryData();
    }, [fetchSummaryData]);

    const summaryLinks: { [key: string]: string } = {
        "Business Summary": "/daily-business",
        "Chits Summary": "/chits",
        "Household Summary": "/household-expenses",
        "Loans Summary": "/loans",
    };

    const SummaryCard: React.FC<{ title: string; data?: { [key: string]: number } }> = ({ title, data }) => (
        <div className="bg-surface p-6 rounded-xl shadow-md h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <h3 className="text-xl font-semibold text-textPrimary mb-4 border-b pb-2">{title}</h3>
            {data ? (
                 <ul className="space-y-2">
                    {Object.entries(data).map(([key, value]) => (
                        <li key={key} className="flex justify-between text-md">
                            <span className="text-textSecondary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-bold text-textPrimary">₹{value.toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            ) : <p>Loading...</p>}
        </div>
    );
    
    if (loading || !summaryData) {
        return <p>Loading summary...</p>
    }
    
    const businessChartData = [
        { name: 'Given', value: summaryData.business.totalGiven, fill: '#EF4444' },
        { name: 'Received', value: summaryData.business.totalReceived, fill: '#22C55E' },
    ];
    
    const householdChartData = [
        { name: 'Income', value: summaryData.household.totalIncome },
        { name: 'Expenses', value: summaryData.household.totalExpenses },
    ];
    const COLORS = ['#10B981', '#F43F5E'];

    const loansChartData = [
        { name: 'Balance to Pay', value: summaryData.loans.balanceToPay, fill: '#EF4444'},
        { name: 'Balance to Receive', value: summaryData.loans.balanceToReceive, fill: '#22C55E' },
    ]

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-textPrimary">Summary Report</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link to={summaryLinks["Business Summary"]}><SummaryCard title="Business Summary" data={summaryData.business} /></Link>
                <Link to={summaryLinks["Chits Summary"]}><SummaryCard title="Chits Summary" data={summaryData.chits} /></Link>
                <Link to={summaryLinks["Household Summary"]}><SummaryCard title="Household Summary" data={summaryData.household} /></Link>
                <Link to={summaryLinks["Loans Summary"]}><SummaryCard title="Loans Summary" data={summaryData.loans} /></Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-textPrimary mb-4">Business Flow</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={businessChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                            <Legend />
                            <Bar dataKey="value" name="Amount" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-surface p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-textPrimary mb-4">Household Income vs. Expenses</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={householdChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                // FIX: Explicitly cast `percent` to a number to prevent type errors.
                                label={({ name, percent }) => `${name} ${(Number(percent || 0) * 100).toFixed(0)}%`}
                            >
                                {householdChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-surface p-6 rounded-xl shadow-md lg:col-span-2">
                    <h3 className="text-xl font-semibold text-textPrimary mb-4">Loan Balances</h3>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={loansChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                            <YAxis type="category" dataKey="name" width={150} />
                            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                            <Legend />
                            <Bar dataKey="value" name="Amount" barSize={40}>
                                {loansChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SummaryReportPage;