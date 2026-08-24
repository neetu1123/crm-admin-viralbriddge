'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Plus, LogOut, UserCog, FileSpreadsheet, FileDown, X } from 'lucide-react';
import { getCurrentUser } from '@/src/lib/useAuth';
import { logout } from '@/src/lib/auth';
import { useSidebar } from './SidebarContext';

const nav = [
  { label: 'Dashboard', href: '/crm', icon: LayoutDashboard, exact: true },
  { label: 'New Lead', href: '/crm/new', icon: Plus },
  { label: 'Agents', href: '/crm/agents', icon: UserCog },
  { label: 'Import History', href: '/crm/import-history', icon: FileSpreadsheet },
  { label: 'Export History', href: '/crm/export-history', icon: FileDown },
];

export default function CrmSidebar() {
  const pathname = usePathname();
  const user = getCurrentUser();
  const { open, setOpen } = useSidebar();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col shrink-0 transform transition-transform duration-200 ease-out lg:static lg:z-auto lg:max-w-none lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-lg">ViralBridge CRM</p>
            <p className="text-xs text-slate-500 mt-0.5">Admin lead management</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden p-1.5 -mr-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
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
    </>
  );
}
