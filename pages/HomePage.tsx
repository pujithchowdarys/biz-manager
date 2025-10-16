
import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

const HomePage: React.FC = () => {
  const moduleItems = NAV_ITEMS.filter(item => item.path !== '/' && item.path !== '/settings');

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-textPrimary">Business Manager Pro</h1>
        <p className="text-lg text-textSecondary mt-2">Welcome! Select a module to get started.</p>
      </header>
      
      <div className="flex items-center mb-8 bg-surface p-4 rounded-lg shadow-md">
        <label htmlFor="business-select" className="text-md font-medium text-textPrimary mr-4">Current Business:</label>
        <select id="business-select" className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
          <option>Main Business</option>
          <option>Side Project Alpha</option>
          <option>Retail Store</option>
        </select>
        <button className="ml-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors shadow-sm">
          + Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleItems.map((item) => (
          <Link to={item.path} key={item.name} className="block group">
            <div className="bg-surface p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
              <div className="flex items-center space-x-4">
                <div className="text-primary group-hover:text-primary-hover transition-colors">
                  {React.cloneElement(item.icon, { className: "h-10 w-10" })}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-textPrimary">{item.name}</h2>
                  <p className="text-textSecondary mt-1">Manage your {item.name.toLowerCase()}.</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
