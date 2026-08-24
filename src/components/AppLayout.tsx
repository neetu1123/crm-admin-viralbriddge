'use client';

import { Menu } from 'lucide-react';
import CrmSidebar from './CrmSidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';

interface AppLayoutProps {
  children: React.ReactNode;
  topNavbar?: React.ReactNode;
}

function LayoutShell({ children, topNavbar }: AppLayoutProps) {
  const { open, toggle } = useSidebar();

  return (
    <div className="flex h-dvh bg-slate-50 overflow-hidden">
      <CrmSidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header
          className={`h-14 bg-white border-b border-slate-200 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 shrink-0 ${
            topNavbar ? '' : 'lg:hidden'
          }`}
        >
          <button
            type="button"
            onClick={toggle}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            {topNavbar ?? (
              <p className="text-lg font-semibold text-slate-800 truncate">ViralBridge CRM</p>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children, topNavbar }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutShell topNavbar={topNavbar}>{children}</LayoutShell>
    </SidebarProvider>
  );
}
