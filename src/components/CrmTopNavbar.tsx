'use client';

import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/crm': 'CRM Dashboard',
  '/crm/new': 'Add New Lead',
};

export default function CrmTopNavbar() {
  const pathname = usePathname();
  const title =
    titles[pathname] ??
    (pathname.endsWith('/edit') ? 'Edit Lead' : pathname.startsWith('/crm/') ? 'Lead Details' : 'CRM');

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
    </header>
  );
}
