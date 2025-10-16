
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const baseLinkClasses = "flex items-center p-3 my-1 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-primary text-white shadow-lg";
  const inactiveLinkClasses = "text-textSecondary hover:bg-primary-light hover:text-primary";

  const NavLinks = () => (
    <nav className="mt-6">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          onClick={() => setIsOpen(false)}
          className={`${baseLinkClasses} ${location.pathname === item.path ? activeLinkClasses : inactiveLinkClasses}`}
        >
          {item.icon}
          <span className="ml-4 font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden fixed top-4 left-4 z-30 p-2 bg-surface rounded-md shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-surface shadow-md">
        <div className="flex items-center justify-center h-20 border-b">
          <h1 className="text-2xl font-bold text-primary">BizManager Pro</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>
      </aside>

      {/* Sidebar for Mobile (Drawer) */}
      <div className={`fixed inset-0 z-20 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsOpen(false)}></div>
        <aside className="relative flex flex-col w-64 h-full bg-surface shadow-xl">
          <div className="flex items-center justify-center h-20 border-b">
            <h1 className="text-2xl font-bold text-primary">BizManager Pro</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <NavLinks />
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
