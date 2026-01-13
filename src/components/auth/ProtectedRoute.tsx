/**
 * @fileoverview Protected Route Component
 *
 * Wrapper component that ensures only authenticated admin users can access certain routes.
 * Automatically redirects to login page if user is not authenticated.
 *
 * @module components/auth/ProtectedRoute
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * ```
 */
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** Child components to render if authenticated */
  children: ReactNode;
  /** Optional: Required role to access this route */
  requiredRole?: 'admin' | 'superadmin';
  /** Optional: Custom redirect path (default: /signin) */
  redirectTo?: string;
}

/**
 * Protected Route Component
 *
 * Wraps admin pages to ensure only authenticated users with proper permissions can access them.
 *
 * @example
 * ```tsx
 * // Protect a page requiring any admin role
 * <ProtectedRoute>
 *   <OrdersPage />
 * </ProtectedRoute>
 *
 * // Protect a page requiring superadmin role
 * <ProtectedRoute requiredRole="superadmin">
 *   <UserManagementPage />
 * </ProtectedRoute>
 * ```
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/signin',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isLoading) {
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      console.warn('User not authenticated, redirecting to login');
      router.replace(redirectTo);
      return;
    }

    // Check role-based access if required
    if (requiredRole && user?.role !== requiredRole) {
      console.warn(`User does not have required role: ${requiredRole}`);
      // Optionally redirect to an "access denied" page
      router.replace('/access-denied'); // TODO: Implement access-denied page
      return;
    }
  }, [isAuthenticated, user, isLoading, requiredRole, redirectTo, router]);

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if role check fails
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

