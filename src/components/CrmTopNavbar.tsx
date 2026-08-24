'use client';

import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/crm': 'CRM Dashboard',
  '/crm/new': 'Add New Lead',
  '/crm/agents': 'CRM Agents',
  '/crm/import-history': 'Import History',
  '/crm/export-history': 'Export History',
};

export default function CrmTopNavbar() {
  const pathname = usePathname();
  const title =
    titles[pathname] ??
    (pathname.endsWith('/edit')
      ? 'Edit Lead'
      : pathname.startsWith('/crm/import-history/')
        ? 'Import Details'
        : pathname.startsWith('/crm/')
          ? 'Lead Details'
          : 'CRM');

  return <h1 className="text-lg font-semibold text-slate-800 truncate">{title}</h1>;
}
