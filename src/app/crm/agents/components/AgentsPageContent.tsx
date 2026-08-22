'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { crmService } from '@/src/lib/crm/crmService';
import type { CrmAgent } from '@/src/lib/crm/types';

export default function AgentsPageContent() {
  const [agents, setAgents] = useState<CrmAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmService
      .getAgents()
      .then(setAgents)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load agents'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/crm" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CRM Agents</h1>
          <p className="text-slate-500 text-sm mt-0.5">Active agents and workload overview</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-violet-600" />
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Users size={40} className="mx-auto mb-3 text-slate-300" />
          <p>No active CRM agents are available.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <Users size={18} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{agent.name}</p>
                  <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                  <span
                    className={`inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      agent.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-2xl font-bold text-violet-700">{agent.assignedLeads}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Assigned Leads</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{agent.todaysFollowUps}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Today&apos;s Follow-ups</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
