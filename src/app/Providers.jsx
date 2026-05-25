"use client";

import { AuthProvider } from '../context/AuthContext';
import { CompareProvider } from '../context/CompareContext';
// Note: We don't need HelmetProvider or react-router-dom in Next.js App Router

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CompareProvider>
        {children}
      </CompareProvider>
    </AuthProvider>
  );
}
