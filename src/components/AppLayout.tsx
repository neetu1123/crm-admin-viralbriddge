'use client';

import CrmSidebar from './CrmSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  topNavbar?: React.ReactNode;
}

export default function AppLayout({ children, topNavbar }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <CrmSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {topNavbar}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-screen-2xl px-6 lg:px-8 xl:px-10 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
