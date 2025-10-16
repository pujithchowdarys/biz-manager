import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  // Fix: Explicitly type icon to accept className for React.cloneElement.
  icon: React.ReactElement<{ className?: string }>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-surface rounded-xl shadow-md p-6 flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
      <div className={`rounded-full p-3 ${color}`}>
        {React.cloneElement(icon, { className: "h-8 w-8 text-white" })}
      </div>
      <div>
        <p className="text-sm font-medium text-textSecondary">{title}</p>
        <p className="text-2xl font-bold text-textPrimary">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;