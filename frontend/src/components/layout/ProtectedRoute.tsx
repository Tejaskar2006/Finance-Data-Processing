/**
 * ProtectedRoute — Redirects unauthenticated users to /login
 * RoleGate — Conditionally renders children based on user role
 *
 * These are the FRONTEND RBAC guards. They improve UX by hiding UI,
 * but the authoritative access control is always enforced by the backend.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If specific roles are required, check the current user's role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

/**
 * RoleGate — Conditionally renders children based on role.
 * Usage: <RoleGate roles={['Admin']}><DeleteButton /></RoleGate>
 */
interface RoleGateProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate = ({ roles, children, fallback = null }: RoleGateProps) => {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? <>{children}</> : <>{fallback}</>;
};
