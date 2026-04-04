/**
 * Sidebar Navigation Component
 * Shows role-aware navigation items.
 * Admin sees Dashboard, Records, Users.
 * Analyst sees Dashboard, Records.
 * Viewer sees Dashboard only (limited).
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, LogOut,
  TrendingUp, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">💹</div>
        <h2>FinanceOS</h2>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>

        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard className="nav-icon" size={18} />
          Dashboard
        </NavLink>

        {/* Analysts and Admins see Records */}
        {hasRole('Admin', 'Analyst') && (
          <NavLink
            to="/records"
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FileText className="nav-icon" size={18} />
            Records
          </NavLink>
        )}

        {/* Viewers see a limited records view */}
        {hasRole('Viewer') && (
          <NavLink
            to="/records"
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FileText className="nav-icon" size={18} />
            View Records
          </NavLink>
        )}

        {/* Analytics visible to Admin and Analyst */}
        {hasRole('Admin', 'Analyst') && (
          <NavLink
            to="/analytics"
            onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <TrendingUp className="nav-icon" size={18} />
            Analytics
          </NavLink>
        )}

        {/* User management — Admin only */}
        {hasRole('Admin') && (
          <>
            <div className="nav-section-label" style={{ marginTop: '1rem' }}>Admin</div>
            <NavLink
              to="/users"
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Users className="nav-icon" size={18} />
              Users
            </NavLink>
          </>
        )}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
