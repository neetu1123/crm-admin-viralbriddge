import {
  MOCK_ADMIN_USERS,
  MOCK_LEADS,
} from './mockData';
import type {
  CrmFilters,
  CrmFollowUp,
  CrmLead,
  CrmLeadInput,
  CrmNote,
  CrmSummary,
  FollowUpStatus,
  LeadPriority,
  TimelineEvent,
} from './types';

const STORAGE_KEY = 'viralbridge_crm_leads';

const PRIORITY_ORDER: Record<LeadPriority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadLeads(): CrmLead[] {
  if (typeof window === 'undefined') return MOCK_LEADS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as CrmLead[];
  } catch {
    /* use defaults */
  }
  return MOCK_LEADS;
}

function saveLeads(leads: CrmLead[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function resolveFollowUpStatus(date: string, time: string, completed: boolean): FollowUpStatus {
  if (completed) return 'completed';
  const now = new Date();
  const followUp = new Date(`${date}T${time || '00:00'}`);
  const todayStr = now.toISOString().slice(0, 10);
  if (date === todayStr) return 'today';
  if (followUp < now) return 'overdue';
  return 'upcoming';
}

function refreshFollowUpStatuses(lead: CrmLead): CrmLead {
  return {
    ...lead,
    followUps: lead.followUps.map((fu) => ({
      ...fu,
      status: resolveFollowUpStatus(fu.date, fu.time, fu.status === 'completed'),
    })),
  };
}

function addTimelineEvent(
  type: TimelineEvent['type'],
  title: string,
  description?: string,
  createdBy?: string,
): TimelineEvent {
  return {
    id: generateId('tl'),
    type,
    title,
    description,
    createdBy,
    createdAt: new Date().toISOString(),
  };
}

export const localCrmStore = {
  getAdminUsers: () => MOCK_ADMIN_USERS,

  getLeadById: (id: string): CrmLead | undefined => {
    const lead = loadLeads().find((l) => l.id === id);
    return lead ? refreshFollowUpStatuses(lead) : undefined;
  },

  getSummary: (): CrmSummary => {
    const leads = loadLeads();
    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      totalLeads: leads.length,
      newLeads: leads.filter((l) => l.leadStatus === 'New').length,
      qualifiedLeads: leads.filter((l) => l.leadStatus === 'Qualified').length,
      convertedLeads: leads.filter((l) => l.leadStatus === 'Won').length,
      lostLeads: leads.filter((l) => l.leadStatus === 'Lost').length,
      todaysFollowUps: leads.filter((l) => l.nextFollowUpDate === todayStr).length,
    };
  },

  filterLeads: (filters: CrmFilters): CrmLead[] => {
    let leads = loadLeads().map(refreshFollowUpStatuses);

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      leads = leads.filter(
        (l) =>
          `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.email.toLowerCase().includes(q),
      );
    }

    if (filters.leadStatus !== 'all') leads = leads.filter((l) => l.leadStatus === filters.leadStatus);
    if (filters.leadType !== 'all') leads = leads.filter((l) => l.leadType === filters.leadType);
    if (filters.priority !== 'all') leads = leads.filter((l) => l.priority === filters.priority);
    if (filters.assignedToId !== 'all') leads = leads.filter((l) => l.assignedToId === filters.assignedToId);
    if (filters.source !== 'all') leads = leads.filter((l) => l.leadSource === filters.source);
    if (filters.dateFrom) leads = leads.filter((l) => l.createdAt.slice(0, 10) >= filters.dateFrom);
    if (filters.dateTo) leads = leads.filter((l) => l.createdAt.slice(0, 10) <= filters.dateTo);

    switch (filters.sort) {
      case 'oldest':
        leads.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case 'priority':
        leads.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
        break;
      case 'updated':
        leads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        break;
      default:
        leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return leads;
  },

  createLead: (input: CrmLeadInput, createdBy?: string): CrmLead => {
    const leads = loadLeads();
    const admin = MOCK_ADMIN_USERS.find((a) => a.id === input.assignedToId);
    const now = new Date().toISOString();
    const lead: CrmLead = {
      ...input,
      id: generateId('lead'),
      assignedToName: admin?.name,
      notes: [],
      followUps: input.nextFollowUpDate
        ? [{
            id: generateId('fu'),
            title: 'Initial follow-up',
            date: input.nextFollowUpDate,
            time: input.nextFollowUpTime || '10:00',
            status: resolveFollowUpStatus(input.nextFollowUpDate, input.nextFollowUpTime || '10:00', false),
            createdAt: now,
          }]
        : [],
      attachments: [],
      timeline: [
        addTimelineEvent('lead_created', 'Lead Created', `${input.firstName} ${input.lastName} from ${input.company}`, createdBy),
      ],
      createdAt: now,
      updatedAt: now,
    };
    leads.unshift(lead);
    saveLeads(leads);
    return lead;
  },

  updateLead: (id: string, input: Partial<CrmLeadInput>, updatedBy?: string): CrmLead | null => {
    const leads = loadLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const existing = leads[index];
    const admin = input.assignedToId
      ? MOCK_ADMIN_USERS.find((a) => a.id === input.assignedToId)
      : undefined;
    const statusChanged = input.leadStatus && input.leadStatus !== existing.leadStatus;

    const updated: CrmLead = {
      ...existing,
      ...input,
      assignedToName: admin?.name ?? existing.assignedToName,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...existing.timeline,
        ...(statusChanged
          ? [addTimelineEvent('status_changed', `Status Changed to ${input.leadStatus}`, `${existing.leadStatus} → ${input.leadStatus}`, updatedBy)]
          : []),
        addTimelineEvent('lead_updated', 'Lead Updated', undefined, updatedBy),
      ],
    };

    leads[index] = updated;
    saveLeads(leads);
    return refreshFollowUpStatuses(updated);
  },

  deleteLead: (id: string): boolean => {
    const leads = loadLeads();
    const filtered = leads.filter((l) => l.id !== id);
    if (filtered.length === leads.length) return false;
    saveLeads(filtered);
    return true;
  },

  archiveLead: (id: string, updatedBy?: string): CrmLead | null =>
    localCrmStore.updateLead(id, { leadStatus: 'Inactive' }, updatedBy),

  addNote: (leadId: string, content: string, createdBy: string): CrmNote | null => {
    const leads = loadLeads();
    const index = leads.findIndex((l) => l.id === leadId);
    if (index === -1) return null;

    const note: CrmNote = {
      id: generateId('note'),
      content,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    leads[index] = {
      ...leads[index],
      notes: [note, ...leads[index].notes],
      updatedAt: new Date().toISOString(),
      timeline: [...leads[index].timeline, addTimelineEvent('note_added', 'Note Added', content.slice(0, 80), createdBy)],
    };
    saveLeads(leads);
    return note;
  },

  updateNote: (leadId: string, noteId: string, content: string): boolean => {
    const leads = loadLeads();
    const index = leads.findIndex((l) => l.id === leadId);
    if (index === -1) return false;
    const noteIndex = leads[index].notes.findIndex((n) => n.id === noteId);
    if (noteIndex === -1) return false;
    leads[index].notes[noteIndex] = { ...leads[index].notes[noteIndex], content, updatedAt: new Date().toISOString() };
    leads[index].updatedAt = new Date().toISOString();
    saveLeads(leads);
    return true;
  },

  deleteNote: (leadId: string, noteId: string): boolean => {
    const leads = loadLeads();
    const index = leads.findIndex((l) => l.id === leadId);
    if (index === -1) return false;
    leads[index].notes = leads[index].notes.filter((n) => n.id !== noteId);
    leads[index].updatedAt = new Date().toISOString();
    saveLeads(leads);
    return true;
  },

  addFollowUp: (leadId: string, data: { title: string; date: string; time: string; notes?: string }): CrmFollowUp | null => {
    const leads = loadLeads();
    const index = leads.findIndex((l) => l.id === leadId);
    if (index === -1) return null;

    const followUp: CrmFollowUp = {
      id: generateId('fu'),
      ...data,
      status: resolveFollowUpStatus(data.date, data.time, false),
      createdAt: new Date().toISOString(),
    };

    leads[index] = {
      ...leads[index],
      followUps: [...leads[index].followUps, followUp],
      nextFollowUpDate: data.date,
      nextFollowUpTime: data.time,
      updatedAt: new Date().toISOString(),
      timeline: [...leads[index].timeline, addTimelineEvent('call_scheduled', 'Follow-up Scheduled', data.title)],
    };
    saveLeads(leads);
    return followUp;
  },

  completeFollowUp: (leadId: string, followUpId: string): boolean => {
    const leads = loadLeads();
    const index = leads.findIndex((l) => l.id === leadId);
    if (index === -1) return false;
    leads[index].followUps = leads[index].followUps.map((fu) =>
      fu.id === followUpId ? { ...fu, status: 'completed' as FollowUpStatus } : fu,
    );
    leads[index].updatedAt = new Date().toISOString();
    leads[index].timeline = [...leads[index].timeline, addTimelineEvent('follow_up_completed', 'Follow-up Completed')];
    saveLeads(leads);
    return true;
  },
};
