'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { CrmFollowUp, FollowUpStatus } from '@/src/lib/crm/types';
import { formatLeadDate } from '@/src/lib/crm/crmService';

const statusConfig: Record<FollowUpStatus, { label: string; icon: React.ElementType; className: string }> = {
  upcoming: { label: 'Upcoming', icon: Clock, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  today: { label: 'Today', icon: Calendar, className: 'bg-violet-50 text-violet-700 border-violet-200' },
  overdue: { label: 'Overdue', icon: AlertCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

interface FollowUpWidgetProps {
  followUps: CrmFollowUp[];
  onAdd: (data: { title: string; date: string; time: string; notes?: string }) => void;
  onComplete: (followUpId: string) => void;
}

export default function FollowUpWidget({ followUps, onAdd, onComplete }: FollowUpWidgetProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<FollowUpStatus | 'all'>('all');

  const handleSubmit = () => {
    if (!title.trim() || !date) return;
    onAdd({ title: title.trim(), date, time, notes: notes.trim() || undefined });
    setTitle('');
    setDate('');
    setTime('10:00');
    setNotes('');
    setShowForm(false);
  };

  const filtered = filter === 'all'
    ? followUps
    : followUps.filter((fu) => fu.status === filter);

  const counts = {
    upcoming: followUps.filter((f) => f.status === 'upcoming').length,
    today: followUps.filter((f) => f.status === 'today').length,
    overdue: followUps.filter((f) => f.status === 'overdue').length,
    completed: followUps.filter((f) => f.status === 'completed').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'upcoming', 'today', 'overdue', 'completed'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === key ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {key === 'all' ? 'All' : statusConfig[key].label}
            {key !== 'all' && ` (${counts[key]})`}
          </button>
        ))}
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
        >
          + Schedule Follow-up
        </button>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-fade-in">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Follow-up title"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
            <button type="button" onClick={handleSubmit} className="px-4 py-1.5 text-sm font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700">Save</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No follow-ups in this category.</p>
        ) : (
          filtered.map((fu) => {
            const config = statusConfig[fu.status];
            const Icon = config.icon;
            return (
              <div key={fu.id} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 animate-fade-in">
                <div className={`p-2 rounded-lg border ${config.className}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{fu.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatLeadDate(fu.date)} at {fu.time}
                  </p>
                  {fu.notes && <p className="text-xs text-slate-400 mt-1">{fu.notes}</p>}
                </div>
                {fu.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => onComplete(fu.id)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
                  >
                    Complete
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
