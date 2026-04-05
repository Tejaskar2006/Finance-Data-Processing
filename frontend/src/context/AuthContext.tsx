/**
 * AuthContext - Global authentication state management
 * Stores the current user and token. Provides login/logout helpers.
 * Token is persisted in localStorage for page refresh survival.
 *
 * WebSocket integration:
 *   - Connects the singleton socket when a token is available.
 *   - Listens for 'role:updated' to silently update the user's role in-place.
 *   - Listens for 'access_request:rejected' to show a rejection toast.
 *   - Disconnects the socket on logout.
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

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('fd_token');
    const storedUser = localStorage.getItem('fd_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupt data — clear storage
        localStorage.removeItem('fd_token');
        localStorage.removeItem('fd_user');
      }
    }
    setIsLoading(false);
  }, []);

  // ── WebSocket: Connect and attach global listeners whenever the token exists ─
  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    // ── role:updated ────────────────────────────────────────────────────────
    // Fired by the server after an Admin approves a role upgrade request.
    // Logs the user out so they re-authenticate and receive a fresh JWT
    // that reflects their new role.
    const onRoleUpdated = ({ newRole }: { newRole: UserRole }) => {
      toast.success(
        `🎉 Your role has been upgraded to ${newRole}! Please log in again to continue.`,
        { duration: 6000 }
      );
      // Short delay so the toast is visible before the redirect
      setTimeout(() => {
        disconnectSocket();
        setToken(null);
        setUser(null);
        localStorage.removeItem('fd_token');
        localStorage.removeItem('fd_user');
        window.location.href = '/login';
      }, 2000);
    };

    // ── access_request:rejected ─────────────────────────────────────────────
    // Fired by the server after an Admin rejects a role upgrade request.
    const onRequestRejected = ({ message }: { message: string }) => {
      toast.error(message, { duration: 5000 });
    };

    socket.on('role:updated', onRoleUpdated);
    socket.on('access_request:rejected', onRequestRejected);

    return () => {
      socket.off('role:updated', onRoleUpdated);
      socket.off('access_request:rejected', onRequestRejected);
    };
  }, [token]);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('fd_token', newToken);
    localStorage.setItem('fd_user', JSON.stringify(newUser));
    // Connect the socket immediately on login
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
   * RBAC helper: checks if current user has one of the specified roles
   * Used for conditional rendering in components (frontend RBAC layer)
   * Note: Backend RBAC is the authoritative check. This is display-only.
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

// Custom hook for convenient access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
