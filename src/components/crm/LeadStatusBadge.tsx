import React from 'react';
import type { LeadStatus } from '@/src/lib/crm/types';

const statusConfig: Record<LeadStatus, { className: string }> = {
  New: { className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  Contacted: { className: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  Qualified: { className: 'bg-violet-50 text-violet-700 border border-violet-200' },
  'Proposal Sent': { className: 'bg-purple-50 text-purple-700 border border-purple-200' },
  Negotiation: { className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  Won: { className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  Lost: { className: 'bg-red-50 text-red-700 border border-red-200' },
  Inactive: { className: 'bg-slate-100 text-slate-500 border border-slate-200' },
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export default function LeadStatusBadge({ status, className = '' }: LeadStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${config.className} ${className}`}>
      {status}
    </span>
  );
}
