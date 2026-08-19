import React from 'react';
import {
  UserPlus,
  RefreshCw,
  ArrowRightLeft,
  Phone,
  Mail,
  Calendar,
  StickyNote,
  CheckCircle,
  Paperclip,
  UserCheck,
} from 'lucide-react';
import type { TimelineEvent } from '@/src/lib/crm/types';
import { formatLeadDate } from '@/src/lib/crm/crmService';

const iconMap: Record<TimelineEvent['type'], React.ElementType> = {
  lead_created: UserPlus,
  lead_updated: RefreshCw,
  status_changed: ArrowRightLeft,
  call_scheduled: Phone,
  email_sent: Mail,
  meeting_added: Calendar,
  note_added: StickyNote,
  follow_up_completed: CheckCircle,
  attachment_uploaded: Paperclip,
  assigned: UserCheck,
};

const colorMap: Record<TimelineEvent['type'], string> = {
  lead_created: 'bg-violet-100 text-violet-600',
  lead_updated: 'bg-slate-100 text-slate-600',
  status_changed: 'bg-blue-100 text-blue-600',
  call_scheduled: 'bg-emerald-100 text-emerald-600',
  email_sent: 'bg-indigo-100 text-indigo-600',
  meeting_added: 'bg-amber-100 text-amber-600',
  note_added: 'bg-yellow-100 text-yellow-600',
  follow_up_completed: 'bg-teal-100 text-teal-600',
  attachment_uploaded: 'bg-orange-100 text-orange-600',
  assigned: 'bg-purple-100 text-purple-600',
};

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (!sorted.length) {
    return <p className="text-sm text-slate-500 py-4">No timeline events yet.</p>;
  }

  return (
    <div className="space-y-0">
      {sorted.map((event, i) => {
        const Icon = iconMap[event.type];
        const isLast = i === sorted.length - 1;
        return (
          <div key={event.id} className="flex gap-3 animate-fade-in">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[event.type]}`}>
                <Icon size={14} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-slate-200 my-1 min-h-[24px]" />}
            </div>
            <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
              <p className="text-sm font-medium text-slate-800">{event.title}</p>
              {event.description && (
                <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                {formatLeadDate(event.createdAt)}
                {event.createdBy ? ` · ${event.createdBy}` : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
