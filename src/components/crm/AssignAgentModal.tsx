'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type { CrmAgent } from '@/src/lib/crm/types';
import { crmService } from '@/src/lib/crm/crmService';

interface AssignAgentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (agentId: string) => Promise<void>;
  title?: string;
  leadCount?: number;
}

export default function AssignAgentModal({
  open,
  onClose,
  onConfirm,
  title = 'Assign Agent',
  leadCount = 1,
}: AssignAgentModalProps) {
  const [agents, setAgents] = useState<CrmAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    crmService
      .getAgents(true)
      .then((list) => {
        setAgents(list);
        setSelectedId(list[0]?.userId ?? '');
      })
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await onConfirm(selectedId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {leadCount} lead{leadCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-violet-600" />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No active agents available.</p>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <label
                  key={agent.userId}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedId === agent.userId
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="agent"
                    value={agent.userId}
                    checked={selectedId === agent.userId}
                    onChange={() => setSelectedId(agent.userId)}
                    className="text-violet-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800">{agent.name}</p>
                    <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 shrink-0">
                    <p>{agent.assignedLeads} leads</p>
                    <p>{agent.todaysFollowUps} today</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 px-5 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!selectedId || submitting || agents.length === 0}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50"
          >
            {submitting ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}
