'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { authApi } from '@/src/lib/api';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginClient() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/crm';
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginForm>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const result = await authApi.login(data.email.trim(), data.password);
      const role = (result.user.role || '').toUpperCase();
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        toast.error('Admin access only. Use an admin account.');
        return;
      }
      localStorage.setItem('token', result.access_token);
      localStorage.setItem('user', JSON.stringify(result.user));
      toast.success(`Welcome, ${result.user.name}`);
      window.location.href = redirectTo.startsWith('/') ? redirectTo : '/crm';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7FC] px-4">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">ViralBridge CRM</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in with your admin account</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...form.register('email', { required: true })}
                type="email"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="admin@gmail.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...form.register('password', { required: true })}
                type="password"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-xs text-slate-400 text-center mt-6">
          Use the same admin email/password as the main admin portal.
        </p>
      </div>
    </div>
  );
}
