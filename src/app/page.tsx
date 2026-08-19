'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    window.location.replace(token ? '/crm' : '/login');
  }, []);
  return null;
}
