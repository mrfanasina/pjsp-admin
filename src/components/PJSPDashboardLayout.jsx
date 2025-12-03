import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, Routes, Route } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';

import SoldesPage from '../pages/SoldesPage';
import PensionsPage from '../pages/PensionsPages';
import ServicesPage from '../pages/ServicesPage';
import ParametresPage from '../pages/ParametresPage';
import MessagePage from '../pages/MessagePage';
import DashboardHome from '../pages/DashboardHome';

import { useHeaderVisibility } from '../contexts/HeaderVisibilityContext';

const routeTitles = {
  '/pjsp/dashboard': 'Tableau de bord',
  '/pjsp/soldes': 'Soldes',
  '/pjsp/pensions': 'Pensions',
  '/pjsp/articles': 'Articles',
  '/pjsp/services': 'Services',
  '/pjsp/parametres': 'Comptes',
  '/pjsp/messages': 'Messages',
};

const PJSPDashboardLayout = () => {
  const { user, setUser } = useAuth();
  const { showHeader } = useHeaderVisibility(); // 👈 récupère l'état du Header
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    setUser(null);
    window.location.href = '/login';
  };

  const headerTitle = routeTitles[location.pathname] || '';

  return (
    <div className="flex h-screen overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onLogout={handleLogout}
      />

      {/* CONTENT */}
      <div
        className={`flex flex-col flex-1 bg-gray-100 transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >

        {/* HEADER (affiché seulement si showHeader = true) */}
        {showHeader && (
          <Header
            title={headerTitle}
            user={user}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onLogout={handleLogout}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="p-6 flex-1 overflow-auto">
          <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="soldes" element={<SoldesPage />} />
            <Route path="pensions" element={<PensionsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="parametres" element={<ParametresPage />} />
            <Route path="messages" element={<MessagePage />} />
            <Route path="*" element={<DashboardHome />} />
          </Routes>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PJSPDashboardLayout;
