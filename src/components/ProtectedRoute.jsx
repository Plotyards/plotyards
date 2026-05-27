"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '../context/auth';
import { grantAdminEntry, hasAdminEntry } from '../utils/adminAccess';

const ProtectedRoute = ({ children, roles = [], loginPath = '/login', requireAdminEntry = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (requireAdminEntry && user?.role === 'admin') {
      grantAdminEntry();
    }

    if (loading) return;

    if (!user) {
      if (requireAdminEntry && !hasAdminEntry()) {
        router.replace('/not-found');
        return;
      }

      const target = loginPath.includes('?')
        ? `${loginPath}&from=${encodeURIComponent(pathname || '/')}`
        : `${loginPath}?from=${encodeURIComponent(pathname || '/')}`;
      router.replace(target);
      return;
    }

    if (roles.length && !roles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [loading, loginPath, pathname, requireAdminEntry, roles, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-32 text-center text-sm font-bold text-muted">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface pt-32 text-center text-sm font-bold text-muted">
        Redirecting to login...
      </div>
    );
  }

  if (roles.length && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-surface pt-32 text-center text-sm font-bold text-muted">
        Redirecting...
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
