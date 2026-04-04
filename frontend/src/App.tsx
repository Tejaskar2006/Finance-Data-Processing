/**
 * App.tsx — Root component with routing and layout
 * Separate layouts for auth pages vs. protected app pages.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RecordsPage from './pages/RecordsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage';
import LandingPage from './pages/LandingPage';

// Layout wrapper for authenticated pages (includes Sidebar)
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="mobile-header">
        <div className="mobile-header-logo">
          <div className="logo-icon">💹</div>
          <h2>FinanceOS</h2>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12122b',
              color: '#f8fafc',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#12122b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#12122b' } },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <AppLayout><DashboardPage /></AppLayout>
              }
            />
            <Route
              path="/records"
              element={
                <AppLayout><RecordsPage /></AppLayout>
              }
            />

            {/* Analytics — Admin and Analyst only */}
            <Route element={<ProtectedRoute allowedRoles={['Admin', 'Analyst']} />}>
              <Route
                path="/analytics"
                element={
                  <AppLayout><AnalyticsPage /></AppLayout>
                }
              />
            </Route>

            {/* Users — Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route
                path="/users"
                element={
                  <AppLayout><UsersPage /></AppLayout>
                }
              />
            </Route>
          </Route>

          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Default redirect for unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
