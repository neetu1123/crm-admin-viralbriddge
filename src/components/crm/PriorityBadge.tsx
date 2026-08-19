import React from 'react';
import type { LeadPriority } from '@/src/lib/crm/types';

const priorityConfig: Record<LeadPriority, { className: string; dot: string }> = {
  Low: { className: 'bg-slate-50 text-slate-600 border border-slate-200', dot: 'bg-slate-400' },
  Medium: { className: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
  High: { className: 'bg-orange-50 text-orange-700 border border-orange-200', dot: 'bg-orange-500' },
  Critical: { className: 'bg-red-50 text-red-700 border border-red-200', dot: 'bg-red-500' },
};

interface PriorityBadgeProps {
  priority: LeadPriority;
  className?: string;
}

export default function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${config.className} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {priority}
    </span>
  );
}
