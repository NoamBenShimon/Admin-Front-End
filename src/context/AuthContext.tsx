/**
 * @fileoverview Authentication Context Provider
 *
 * Provides authentication state and methods throughout the admin application.
 * Manages admin user session with enhanced security features.
 *
 * @module context/AuthContext
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, login, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   await login('admin', 'password');
 * }
 * ```
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as api from '@/services/api';
import type { User } from '@/types/api';

/**
 * Shape of the authentication context value
 */
interface AuthContextType {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user information (null if not authenticated) */
  user: User | null;
  /** Whether authentication state is being loaded */
  isLoading: boolean;
  /** Login function */
  login: (username: string, password: string) => Promise<void>;
  /** Logout function */
  logout: () => Promise<void>;
  /** Refresh authentication status */
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Wraps the application to provide authentication state and methods.
 * Automatically checks authentication status on mount.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check authentication status with backend
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const authStatus = await api.checkAuth();

      if (authStatus.authenticated && authStatus.userid && authStatus.username) {
        setIsAuthenticated(true);
        setUser({
          userid: authStatus.userid,
          username: authStatus.username,
          role: authStatus.role || 'admin',
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Login function
   *
   * @param username - Admin username
   * @param password - Admin password
   * @throws {Error} If login fails
   */
  const login = async (username: string, password: string) => {
    try {
      const response = await api.login({ username, password });

      setIsAuthenticated(true);
      setUser({
        userid: response.userid,
        username: response.username,
        role: response.role || 'admin',
      });
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error; // Re-throw for component error handling
    }
  };

  /**
   * Logout function
   *
   * Clears authentication state and calls logout endpoint.
   */
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  /**
   * Refresh authentication status
   *
   * Useful for checking if session is still valid.
   */
  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  // Show nothing while loading to prevent flash of wrong content
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 *
 * @throws {Error} If used outside AuthProvider
 * @returns Authentication context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, user, logout } = useAuth();
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <>
 *           <p>Welcome, {user?.username}!</p>
 *           <button onClick={logout}>Logout</button>
 *         </>
 *       ) : (
 *         <p>Please log in</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

