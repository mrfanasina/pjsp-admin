import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, Settings, FileText, DollarSign, MessageCircle, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard, Person } from '@mui/icons-material';

const menuItems = [
  { to: '/pjsp/dashboard', icon: <Dashboard />, label: 'Tableau de bord' },
  { to: '/pjsp/soldes', icon: <DollarSign />, label: 'Soldes' },
  { to: '/pjsp/pensions', icon: <FileText />, label: 'Pensions' },
  { to: '/pjsp/services', icon: <Users />, label: 'Services' },
  { to: '/pjsp/messages', icon: <MessageCircle />, label: 'Messages' },
  { to: '/pjsp/parametres', icon: <Person />, label: 'Comptes' },
];

const Sidebar = ({ isOpen, onToggle, onLogout }) => {
  const { user } = useAuth();

  if (!user) return null;

  const initial = user.displayName ? user.displayName[0].toUpperCase() : '?';

  return (
    <aside className={`fixed inset-y-0 left-0 bg-white shadow-lg z-20 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col justify-between`}> 
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 shadow-sm">
        {isOpen && (
          <h1 className="text-xl font-bold text-gray-700 break-words">PJSP-ADMIN</h1>
        )}
        <button onClick={onToggle} className="p-2 rounded hover:bg-gray-100 transition">
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-4 flex flex-col space-y-2 px-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <span className="w-6 h-6">{item.icon}</span>
            {isOpen && <span className="ml-3 text-base">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Avatar + logout */}
      <div className="w-full px-4 py-4 border-t border-gray-200 flex items-center space-x-2">
        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
          {initial}
        </div>
        {isOpen && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user.displayName}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
            <button onClick={onLogout} className="text-red-600 hover:text-red-400 cursor-pointer mt-1 flex items-center">
              <LogOut className="mr-1" size={16} /> Déconnexion
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
