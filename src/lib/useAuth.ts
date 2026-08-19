'use client';

import { useEffect, useState } from 'react';
import { logout as performLogout } from './auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

function isAdminRole(role?: string): boolean {
  const r = (role || '').toUpperCase();
  return r === 'ADMIN' || r === 'SUPER_ADMIN';
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return;
    }

    try {
      const parsed: AuthUser = JSON.parse(userStr);
      if (!isAdminRole(parsed.role)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setUser(parsed);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }

    setLoading(false);
  }, []);

  return { user, loading, logout: () => void performLogout() };
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? (JSON.parse(userStr) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
