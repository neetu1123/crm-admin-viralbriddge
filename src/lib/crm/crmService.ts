import type {
  CrmFilters,
  CrmFollowUp,
  CrmLead,
  CrmLeadInput,
  CrmNote,
  CrmSummary,
} from './types';
import { crmApi } from '@/src/lib/api';
import { localCrmStore } from './localCrmStore';

let preferLocal = false;

function shouldUseLocal(error: unknown): boolean {
  if (preferLocal) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('404') ||
      msg.includes('cannot reach') ||
      msg.includes('timed out')
    ) {
      preferLocal = true;
      return true;
    }
  }
  return false;
}

async function withFallback<T>(apiCall: () => Promise<T>, localCall: () => T | Promise<T>): Promise<T> {
  if (preferLocal) return localCall() as T;
  try {
    return await apiCall();
  } catch (error) {
    if (shouldUseLocal(error)) {
      return localCall() as T;
    }
    throw error;
  }
}

export const crmService = {
  getAdminUsers: () =>
    withFallback(() => crmApi.getAssignees(), () => localCrmStore.getAdminUsers()),

  getSummary: (): Promise<CrmSummary> =>
    withFallback(() => crmApi.getSummary(), () => localCrmStore.getSummary()),

  filterLeads: (filters: CrmFilters): Promise<CrmLead[]> =>
    withFallback(
      async () => {
        const res = await crmApi.getLeads({
          search: filters.search || undefined,
          leadStatus: filters.leadStatus !== 'all' ? filters.leadStatus : undefined,
          leadType: filters.leadType !== 'all' ? filters.leadType : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
          assignedToId: filters.assignedToId !== 'all' ? filters.assignedToId : undefined,
          source: filters.source !== 'all' ? filters.source : undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          sort: filters.sort,
          limit: 500,
        });
        return res.data;
      },
      () => localCrmStore.filterLeads(filters),
    ),

  getLeadById: (id: string): Promise<CrmLead | undefined> =>
    withFallback(
      () => crmApi.getLead(id),
      () => localCrmStore.getLeadById(id),
    ).catch(() => undefined),

  createLead: (input: CrmLeadInput, createdBy?: string): Promise<CrmLead> =>
    withFallback(
      () => crmApi.createLead(input),
      () => localCrmStore.createLead(input, createdBy),
    ),

  updateLead: (
    id: string,
    input: Partial<CrmLeadInput>,
    updatedBy?: string,
  ): Promise<CrmLead | null> =>
    withFallback(
      async () => {
        const existing = await crmApi.getLead(id);
        const merged: CrmLeadInput = {
          firstName: input.firstName ?? existing.firstName,
          lastName: input.lastName ?? existing.lastName,
          profilePhoto: input.profilePhoto ?? existing.profilePhoto,
          gender: input.gender ?? existing.gender,
          dateOfBirth: input.dateOfBirth ?? existing.dateOfBirth,
          email: input.email ?? existing.email,
          phone: input.phone ?? existing.phone,
          alternatePhone: input.alternatePhone ?? existing.alternatePhone,
          whatsapp: input.whatsapp ?? existing.whatsapp,
          website: input.website ?? existing.website,
          company: input.company ?? existing.company,
          jobTitle: input.jobTitle ?? existing.jobTitle,
          industry: input.industry ?? existing.industry,
          companySize: input.companySize ?? existing.companySize,
          gstNumber: input.gstNumber ?? existing.gstNumber,
          country: input.country ?? existing.country,
          state: input.state ?? existing.state,
          city: input.city ?? existing.city,
          postalCode: input.postalCode ?? existing.postalCode,
          address: input.address ?? existing.address,
          leadType: input.leadType ?? existing.leadType,
          leadSource: input.leadSource ?? existing.leadSource,
          priority: input.priority ?? existing.priority,
          leadStatus: input.leadStatus ?? existing.leadStatus,
          assignedToId: input.assignedToId ?? existing.assignedToId,
          dealCurrency: input.dealCurrency ?? existing.dealCurrency,
          dealValue: input.dealValue ?? existing.dealValue,
          nextFollowUpDate: input.nextFollowUpDate ?? existing.nextFollowUpDate,
          nextFollowUpTime: input.nextFollowUpTime ?? existing.nextFollowUpTime,
          description: input.description ?? existing.description,
          internalNotes: input.internalNotes ?? existing.internalNotes,
          tags: input.tags ?? existing.tags,
        };
        return crmApi.updateLead(id, merged);
      },
      () => localCrmStore.updateLead(id, input, updatedBy),
    ),

  deleteLead: (id: string): Promise<boolean> =>
    withFallback(
      async () => {
        await crmApi.deleteLead(id);
        return true;
      },
      () => localCrmStore.deleteLead(id),
    ),

  archiveLead: (id: string, updatedBy?: string): Promise<CrmLead | null> =>
    withFallback(
      () => crmApi.archiveLead(id),
      () => localCrmStore.archiveLead(id, updatedBy),
    ),

  addNote: (leadId: string, content: string, createdBy: string): Promise<CrmNote | null> =>
    withFallback(
      () => crmApi.addNote(leadId, content) as Promise<CrmNote>,
      () => localCrmStore.addNote(leadId, content, createdBy),
    ),

  updateNote: (leadId: string, noteId: string, content: string): Promise<boolean> =>
    withFallback(
      async () => {
        await crmApi.updateNote(leadId, noteId, content);
        return true;
      },
      () => localCrmStore.updateNote(leadId, noteId, content),
    ),

  deleteNote: (leadId: string, noteId: string): Promise<boolean> =>
    withFallback(
      async () => {
        await crmApi.deleteNote(leadId, noteId);
        return true;
      },
      () => localCrmStore.deleteNote(leadId, noteId),
    ),

  addFollowUp: (
    leadId: string,
    data: { title: string; date: string; time: string; notes?: string },
  ): Promise<CrmFollowUp | null> =>
    withFallback(
      () => crmApi.addFollowUp(leadId, data) as Promise<CrmFollowUp>,
      () => localCrmStore.addFollowUp(leadId, data),
    ),

  completeFollowUp: (leadId: string, followUpId: string): Promise<boolean> =>
    withFallback(
      async () => {
        await crmApi.completeFollowUp(leadId, followUpId);
        return true;
      },
      () => localCrmStore.completeFollowUp(leadId, followUpId),
    ),
};

export function getLeadFullName(lead: CrmLead): string {
  return `${lead.firstName} ${lead.lastName}`.trim();
}

export function formatLeadDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDealValue(currency: string, value?: number): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function leadToInput(lead: CrmLead): CrmLeadInput {
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    profilePhoto: lead.profilePhoto,
    gender: lead.gender,
    dateOfBirth: lead.dateOfBirth,
    email: lead.email,
    phone: lead.phone,
    alternatePhone: lead.alternatePhone,
    whatsapp: lead.whatsapp,
    website: lead.website,
    company: lead.company,
    jobTitle: lead.jobTitle,
    industry: lead.industry,
    companySize: lead.companySize,
    gstNumber: lead.gstNumber,
    country: lead.country,
    state: lead.state,
    city: lead.city,
    postalCode: lead.postalCode,
    address: lead.address,
    leadType: lead.leadType,
    leadSource: lead.leadSource,
    priority: lead.priority,
    leadStatus: lead.leadStatus,
    assignedToId: lead.assignedToId,
    dealCurrency: lead.dealCurrency,
    dealValue: lead.dealValue,
    nextFollowUpDate: lead.nextFollowUpDate,
    nextFollowUpTime: lead.nextFollowUpTime,
    description: lead.description,
    internalNotes: lead.internalNotes,
    tags: lead.tags,
  };
}
