import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loader from './utils/Loader';
import { AuthProvider } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import PJSPDashboardLayout from './components/PJSPDashboardLayout';
import { HeaderVisibilityProvider } from './contexts/HeaderVisibilityContext';
import { testInternetConnection } from './services/solde';

// Lazy loaded pages
const LoginPage = React.lazy(() => import('./pages/Login'));
const DashboardHome = React.lazy(() => import('./pages/DashboardHome'));
const SoldesPage = React.lazy(() => import('./pages/SoldesPage'));
const PensionsPage = React.lazy(() => import('./pages/PensionsPages'));
const ArticlesPage = React.lazy(() => import('./pages/ArticlesPage'));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage'));
const ParametresPage = React.lazy(() => import('./pages/ParametresPage'));
const MessagePage = React.lazy(() => import('./pages/MessagePage'));
const NotFound = React.lazy(() => import('./components/NotFound'));
const NotAuthorized = React.lazy(() => import('./pages/NonAutorise'));


const App = () => {
  useEffect(() => {
     testInternetConnection();
  }, []);
  return (
  <SearchProvider>
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pjsp/*" element={<PJSPDashboardLayout />} />
          <Route path="/non-autorise" element={<NotAuthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </SearchProvider>
  )
}
export default App;