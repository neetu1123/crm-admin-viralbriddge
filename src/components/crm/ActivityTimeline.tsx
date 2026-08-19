import React from 'react';
import type { TimelineEvent } from '@/src/lib/crm/types';
import { formatLeadDate } from '@/src/lib/crm/crmService';

const activityLabels: Record<TimelineEvent['type'], string> = {
  lead_created: 'Lead Created',
  lead_updated: 'Edited',
  status_changed: 'Status Updated',
  call_scheduled: 'Call Scheduled',
  email_sent: 'Email Sent',
  meeting_added: 'Meeting Added',
  note_added: 'Note Added',
  follow_up_completed: 'Follow-up Completed',
  attachment_uploaded: 'Attachment Uploaded',
  assigned: 'Assigned',
};

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  const activityEvents = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (!activityEvents.length) {
    return <p className="text-sm text-slate-500 py-4">No activity recorded yet.</p>;
  }

  return (
    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
      {activityEvents.map((event) => (
        <div key={event.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors animate-fade-in">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {activityLabels[event.type] ?? event.title}
            </p>
            {event.description && (
              <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-xs text-slate-400">{formatLeadDate(event.createdAt)}</p>
            {event.createdBy && (
              <p className="text-xs text-slate-400">{event.createdBy}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
