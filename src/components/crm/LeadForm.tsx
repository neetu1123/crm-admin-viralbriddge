'use client';

import React, { useEffect, useState } from 'react';
import type { AdminUser, CrmLead, CrmLeadInput } from '@/src/lib/crm/types';
import {
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  LEAD_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  TAG_OPTIONS,
} from '@/src/lib/crm/mockData';

export const defaultLeadForm: CrmLeadInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  leadType: 'Brand',
  leadSource: 'Manual Entry',
  priority: 'Medium',
  leadStatus: 'New',
  dealCurrency: 'INR',
  tags: [],
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30';

interface LeadFormProps {
  initialData?: CrmLead | CrmLeadInput | null;
  assignees: AdminUser[];
  saving?: boolean;
  submitLabel?: string;
  onSubmit: (data: CrmLeadInput) => void;
}

export default function LeadForm({
  initialData,
  assignees,
  saving = false,
  submitLabel = 'Save Lead',
  onSubmit,
}: LeadFormProps) {
  const [form, setForm] = useState<CrmLeadInput>(defaultLeadForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        profilePhoto: initialData.profilePhoto,
        gender: initialData.gender,
        dateOfBirth: initialData.dateOfBirth,
        email: initialData.email,
        phone: initialData.phone,
        alternatePhone: initialData.alternatePhone,
        whatsapp: initialData.whatsapp,
        website: initialData.website,
        company: initialData.company,
        jobTitle: initialData.jobTitle,
        industry: initialData.industry,
        companySize: initialData.companySize,
        gstNumber: initialData.gstNumber,
        country: initialData.country,
        state: initialData.state,
        city: initialData.city,
        postalCode: initialData.postalCode,
        address: initialData.address,
        leadType: initialData.leadType,
        leadSource: initialData.leadSource,
        priority: initialData.priority,
        leadStatus: initialData.leadStatus,
        assignedToId: initialData.assignedToId,
        dealCurrency: initialData.dealCurrency,
        dealValue: initialData.dealValue,
        nextFollowUpDate: initialData.nextFollowUpDate,
        nextFollowUpTime: initialData.nextFollowUpTime,
        description: initialData.description,
        internalNotes: initialData.internalNotes,
        tags: initialData.tags ?? [],
      });
    } else {
      setForm(defaultLeadForm);
    }
  }, [initialData]);

  const set = <K extends keyof CrmLeadInput>(key: K, value: CrmLeadInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !form.company.trim()) {
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <Section title="Personal Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="First Name" required>
            <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Last Name" required>
            <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputCls} required />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Gender">
            <select value={form.gender ?? ''} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Date of Birth">
            <input type="date" value={form.dateOfBirth ?? ''} onChange={(e) => set('dateOfBirth', e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Contact Information">
        <Field label="Email" required>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} required />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Phone Number" required>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Alternate Phone">
            <input value={form.alternatePhone ?? ''} onChange={(e) => set('alternatePhone', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="WhatsApp Number">
            <input value={form.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Website">
            <input value={form.website ?? ''} onChange={(e) => set('website', e.target.value)} className={inputCls} placeholder="https://" />
          </Field>
        </div>
      </Section>

      <Section title="Company Information">
        <Field label="Company Name" required>
          <input value={form.company} onChange={(e) => set('company', e.target.value)} className={inputCls} required />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Job Title">
            <input value={form.jobTitle ?? ''} onChange={(e) => set('jobTitle', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Industry">
            <input value={form.industry ?? ''} onChange={(e) => set('industry', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Company Size">
            <select value={form.companySize ?? ''} onChange={(e) => set('companySize', e.target.value)} className={inputCls}>
              <option value="">Select</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="50-200">50-200</option>
              <option value="200-1000">200-1000</option>
              <option value="1000+">1000+</option>
            </select>
          </Field>
          <Field label="GST Number">
            <input value={form.gstNumber ?? ''} onChange={(e) => set('gstNumber', e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Address">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Country">
            <input value={form.country ?? ''} onChange={(e) => set('country', e.target.value)} className={inputCls} />
          </Field>
          <Field label="State">
            <input value={form.state ?? ''} onChange={(e) => set('state', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="City">
            <input value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Postal Code">
            <input value={form.postalCode ?? ''} onChange={(e) => set('postalCode', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Address">
          <textarea value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
        </Field>
      </Section>

      <Section title="Lead Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Lead Type">
            <select value={form.leadType} onChange={(e) => set('leadType', e.target.value as CrmLeadInput['leadType'])} className={inputCls}>
              {LEAD_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Lead Source">
            <select value={form.leadSource} onChange={(e) => set('leadSource', e.target.value as CrmLeadInput['leadSource'])} className={inputCls}>
              {LEAD_SOURCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => set('priority', e.target.value as CrmLeadInput['priority'])} className={inputCls}>
              {PRIORITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Lead Status">
            <select value={form.leadStatus} onChange={(e) => set('leadStatus', e.target.value as CrmLeadInput['leadStatus'])} className={inputCls}>
              {LEAD_STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Assigned To">
          <select value={form.assignedToId ?? ''} onChange={(e) => set('assignedToId', e.target.value || undefined)} className={inputCls}>
            <option value="">Unassigned</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Currency">
            <select value={form.dealCurrency} onChange={(e) => set('dealCurrency', e.target.value)} className={inputCls}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          <Field label="Expected Deal Value">
            <input type="number" value={form.dealValue ?? ''} onChange={(e) => set('dealValue', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} min={0} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Next Follow-up Date">
            <input type="date" value={form.nextFollowUpDate ?? ''} onChange={(e) => set('nextFollowUpDate', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Time">
            <input type="time" value={form.nextFollowUpTime ?? ''} onChange={(e) => set('nextFollowUpTime', e.target.value)} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Description & Notes">
        <Field label="Description">
          <textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={3} className={`${inputCls} resize-none`} />
        </Field>
        <Field label="Internal Notes">
          <textarea value={form.internalNotes ?? ''} onChange={(e) => set('internalNotes', e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Admin-only notes" />
        </Field>
      </Section>

      <Section title="Tags">
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                form.tags.includes(tag)
                  ? 'bg-violet-100 text-violet-700 border border-violet-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
