'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Plus, LogOut } from 'lucide-react';
import { getCurrentUser } from '@/src/lib/useAuth';
import { logout } from '@/src/lib/auth';

const nav = [
  { label: 'Dashboard', href: '/crm', icon: LayoutDashboard },
  { label: 'New Lead', href: '/crm/new', icon: Plus },
];

export default function CrmSidebar() {
  const pathname = usePathname();
  const user = getCurrentUser();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-100">
        <p className="font-bold text-slate-800 text-lg">ViralBridge CRM</p>
        <p className="text-xs text-slate-500 mt-0.5">Admin lead management</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const active = item.href === '/crm' ? pathname === '/crm' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        {user && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <Users size={14} className="text-violet-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => void logout()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
