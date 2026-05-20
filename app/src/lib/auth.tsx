'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
import type { User, AuthResponse } from '@/types';

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('valence_token');
    const storedUser = localStorage.getItem('valence_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
    }
    setLoading(false);
  }, []);

  const persist = (data: AuthResponse) => {
    localStorage.setItem('valence_token', data.token);
    localStorage.setItem('valence_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    persist(data);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name });
    persist(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('valence_token');
    localStorage.removeItem('valence_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
