"use client";

import { useEffect, useMemo, useState } from 'react';
import { apiRequest, clearSession, getStoredUser, getToken, setSession } from '../lib/api';
import { revokeAdminEntry } from '../utils/adminAccess';
import { AuthContext } from './auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    const loadUser = async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/auth/me');
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (payload) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: payload
    });
    setSession(data);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: payload
    });
    setSession(data);
    setUser(data.user);
    return data.user;
  };

  const updateMe = async (payload) => {
    const data = await apiRequest('/auth/me', {
      method: 'PATCH',
      body: payload
    });
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const refreshMe = async () => {
    const data = await apiRequest('/auth/me');
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    clearSession();
    revokeAdminEntry();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    isBroker: user?.role === 'broker',
    isAdmin: user?.role === 'admin' || user?.isAdmin,
    login,
    register,
    updateMe,
    refreshMe,
    logout
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
