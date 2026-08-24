'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/src/lib/useAuth';
import { crmService, leadToInput } from '@/src/lib/crm/crmService';
import type { AdminUser, CrmLead, CrmLeadInput } from '@/src/lib/crm/types';
import LeadForm from '@/src/components/crm/LeadForm';

interface LeadFormPageContentProps {
  mode: 'create' | 'edit';
  leadId?: string;
}

export default function LeadFormPageContent({ mode, leadId }: LeadFormPageContentProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [assignees, setAssignees] = useState<AdminUser[]>([]);
  const [lead, setLead] = useState<CrmLead | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    crmService.getAdminUsers().then(setAssignees).catch(() => setAssignees([]));
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !leadId) return;
    setLoading(true);
    crmService
      .getLeadById(leadId)
      .then((data) => {
        if (!data) {
          toast.error('Lead not found');
          router.push('/crm');
          return;
        }
        setLead(data);
      })
      .catch(() => {
        toast.error('Failed to load lead');
        router.push('/crm');
      })
      .finally(() => setLoading(false));
  }, [mode, leadId, router]);

  const handleSubmit = async (data: CrmLeadInput) => {
    setSaving(true);
    try {
      if (mode === 'create') {
        const created = await crmService.createLead(data, user?.name);
        toast.success('Lead created successfully');
        router.push(`/crm/${created.id}`);
      } else if (leadId) {
        await crmService.updateLead(leadId, data, user?.name);
        toast.success('Lead updated successfully');
        router.push(`/crm/${leadId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  const backHref = mode === 'edit' && leadId ? `/crm/${leadId}` : '/crm';
  const title = mode === 'create' ? 'Add New Lead' : 'Edit Lead';
  const subtitle = mode === 'create'
    ? 'Create a new CRM lead record'
    : `Update details for ${lead?.firstName ?? ''} ${lead?.lastName ?? ''}`.trim();

  return (
    <div className="pb-8 max-w-3xl">
      <Toaster position="bottom-right" richColors />

      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={16} /> {mode === 'edit' ? 'Back to Lead' : 'Back to CRM'}
      </Link>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <LeadForm
          initialData={mode === 'edit' && lead ? leadToInput(lead) : null}
          assignees={assignees}
          saving={saving}
          submitLabel={mode === 'create' ? 'Create Lead' : 'Save Changes'}
          onSubmit={handleSubmit}
        />
      </div>

      <div className="mt-4">
        <Link href={backHref} className="text-sm font-medium text-slate-500 hover:text-slate-700">
          Cancel
        </Link>
      </div>
    </div>
  );
}
