"use client";

import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  isBroker: false,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  updateMe: async () => {},
  refreshMe: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);
