import React from 'react';
import Link from 'next/link';
import { Building2, Mail, Phone } from 'lucide-react';
import type { CrmLead } from '@/src/lib/crm/types';
import { formatLeadDate, getLeadFullName } from '@/src/lib/crm/crmService';
import LeadStatusBadge from './LeadStatusBadge';
import PriorityBadge from './PriorityBadge';

interface LeadCardProps {
  lead: CrmLead;
  compact?: boolean;
}

export default function LeadCard({ lead, compact = false }: LeadCardProps) {
  const initials = `${lead.firstName[0] ?? ''}${lead.lastName[0] ?? ''}`.toUpperCase();

  return (
    <Link
      href={`/crm/${lead.id}`}
      className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {lead.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800 truncate">{getLeadFullName(lead)}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building2 size={12} /> {lead.company}
              </p>
            </div>
            <LeadStatusBadge status={lead.leadStatus} />
          </div>
          {!compact && (
            <>
              <div className="flex flex-wrap gap-2 mt-2">
                <PriorityBadge priority={lead.priority} />
                <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">{lead.leadType}</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
                <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Created {formatLeadDate(lead.createdAt)}</p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
