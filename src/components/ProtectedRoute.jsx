"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useAuth } from '../context/auth';
import { grantAdminEntry, hasAdminEntry } from '../utils/adminAccess';

const ProtectedRoute = ({ children, roles = [], loginPath = '/login', requireAdminEntry = false }) => {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (requireAdminEntry && user?.role === 'admin') {
      grantAdminEntry();
    }
  }, [requireAdminEntry, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-32 text-center text-sm font-bold text-muted">
        Loading...
      </div>
    );
  }

  if (!user) {
    if (requireAdminEntry && !hasAdminEntry()) {
      return <Navigate to="/not-found" replace />;
    }

    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
