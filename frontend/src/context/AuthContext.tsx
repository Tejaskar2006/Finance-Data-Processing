/**
 * AuthContext - Global authentication state management
 * Stores the current user and token. Provides login/logout helpers.
 * Token is persisted in localStorage for page refresh survival.
 *
 * WebSocket integration:
 *   - Creates the singleton socket the moment a token is available.
 *   - Attaches global event listeners (role:updated, access_request:rejected).
 *   - On 'role:updated': shows toast, then auto-logs out → /login for fresh JWT.
 *   - On 'access_request:rejected': shows error toast.
 *   - On logout: disconnects the socket so the next login creates a fresh one.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { User, UserRole } from '../types';
import { getSocket, disconnectSocket } from '../services/socket';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session from localStorage on mount ────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('fd_token');
    const storedUser = localStorage.getItem('fd_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('fd_token');
        localStorage.removeItem('fd_user');
      }
    }
    setIsLoading(false);
  }, []);

  // ── WebSocket: connect and attach listeners whenever a token exists ────────
  useEffect(() => {
    if (!token) return;

    // getSocket creates the singleton (or returns the existing one if alive).
    const socket = getSocket(token);

    // ── role:updated ─────────────────────────────────────────────────────────
    // Fired by the server after an Admin approves the role upgrade request.
    // We force a full logout so the user re-authenticates with a fresh JWT
    // that has the new role encoded in it.
    const onRoleUpdated = ({ newRole }: { newRole: UserRole }) => {
      // Show toast first, then log out after a short delay so it's readable.
      toast.success(
        `🎉 Your role has been upgraded to ${newRole}! Please log in again to continue.`,
        { duration: 6000 }
      );

      setTimeout(() => {
        // Clear state + storage, disconnect socket, hard-navigate to /login.
        disconnectSocket();
        setToken(null);
        setUser(null);
        localStorage.removeItem('fd_token');
        localStorage.removeItem('fd_user');
        // Hard navigate ensures the React tree is fully remounted with no stale state.
        window.location.href = '/login';
      }, 2000);
    };

    // ── access_request:rejected ───────────────────────────────────────────────
    // Fired by the server after an Admin rejects the role upgrade request.
    const onRequestRejected = ({ message }: { message: string }) => {
      toast.error(message, { duration: 5000 });
    };

    socket.on('role:updated', onRoleUpdated);
    socket.on('access_request:rejected', onRequestRejected);

    // Cleanup: remove only these specific handlers — do NOT disconnect the socket.
    return () => {
      socket.off('role:updated', onRoleUpdated);
      socket.off('access_request:rejected', onRequestRejected);
    };
  }, [token]);

  // ─────────────────────────────────────────────────────────────────────────────

  const login = useCallback((newToken: string, newUser: User) => {
    // Ensure any previous socket is gone before creating a new authenticated one.
    disconnectSocket();
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('fd_token', newToken);
    localStorage.setItem('fd_user', JSON.stringify(newUser));
    // Pre-emptively create the socket so it's ready before any component mounts.
    getSocket(newToken);
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    setToken(null);
    setUser(null);
    localStorage.removeItem('fd_token');
    localStorage.removeItem('fd_user');
  }, []);

  /**
   * RBAC helper: checks if current user has one of the specified roles.
   * Used for conditional rendering — backend is the authoritative gatekeeper.
   */
  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
