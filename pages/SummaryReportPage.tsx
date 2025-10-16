
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SUMMARY_DATA } from '../constants';

const SummaryReportPage: React.FC = () => {
    const businessData = [
        { name: 'Given', value: SUMMARY_DATA.business.totalGiven, fill: '#EF4444' },
        { name: 'Received', value: SUMMARY_DATA.business.totalReceived, fill: '#22C55E' },
    ];
    
    const householdData = [
        { name: 'Income', value: SUMMARY_DATA.household.totalIncome },
        { name: 'Expenses', value: SUMMARY_DATA.household.totalExpenses },
    ];
    const COLORS = ['#10B981', '#F43F5E'];

    const loansData = [
        { name: 'Balance to Pay', value: SUMMARY_DATA.loans.balanceToPay, fill: '#EF4444'},
        { name: 'Balance to Receive', value: SUMMARY_DATA.loans.balanceToReceive, fill: '#22C55E' },
    ]

    const SummaryCard: React.FC<{ title: string; data: { [key: string]: number } }> = ({ title, data }) => (
        <div className="bg-surface p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-textPrimary mb-4 border-b pb-2">{title}</h3>
            <ul className="space-y-2">
                {Object.entries(data).map(([key, value]) => (
                    <li key={key} className="flex justify-between text-md">
                        <span className="text-textSecondary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-bold text-textPrimary">₹{value.toLocaleString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-textPrimary">Summary Report</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SummaryCard title="Business Summary" data={SUMMARY_DATA.business} />
                <SummaryCard title="Chits Summary" data={SUMMARY_DATA.chits} />
                <SummaryCard title="Household Summary" data={SUMMARY_DATA.household} />
                <SummaryCard title="Loans Summary" data={SUMMARY_DATA.loans} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-textPrimary mb-4">Business Flow</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={businessData}>
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
                                data={householdData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {householdData.map((entry, index) => (
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
                         <BarChart data={loansData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                            <YAxis type="category" dataKey="name" width={150} />
                            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']} />
                            <Legend />
                            <Bar dataKey="value" name="Amount" barSize={40}>
                                {loansData.map((entry, index) => (
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
