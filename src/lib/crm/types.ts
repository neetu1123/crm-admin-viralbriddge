export type LeadType =
  | 'Brand'
  | 'Creator'
  | 'Agency'
  | 'Enterprise Client'
  | 'Investor'
  | 'Partner'
  | 'Other';

export type LeadSource =
  | 'Website'
  | 'Referral'
  | 'Social Media'
  | 'Email Campaign'
  | 'Cold Call'
  | 'Manual Entry'
  | 'Advertisement';

export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Inactive';

export type TimelineEventType =
  | 'lead_created'
  | 'lead_updated'
  | 'status_changed'
  | 'call_scheduled'
  | 'email_sent'
  | 'meeting_added'
  | 'note_added'
  | 'follow_up_completed'
  | 'attachment_uploaded'
  | 'assigned';

export type FollowUpStatus = 'upcoming' | 'today' | 'overdue' | 'completed';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface CrmNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CrmFollowUp {
  id: string;
  title: string;
  date: string;
  time: string;
  status: FollowUpStatus;
  notes?: string;
  createdAt: string;
}

export interface CrmAttachment {
  id: string;
  name: string;
  type: 'business_card' | 'document' | 'image' | 'pdf';
  size: string;
  uploadedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  createdBy?: string;
  createdAt: string;
  meta?: Record<string, string>;
}

export interface CrmLead {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  gender?: string;
  dateOfBirth?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  whatsapp?: string;
  website?: string;
  company: string;
  jobTitle?: string;
  industry?: string;
  companySize?: string;
  gstNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  leadType: LeadType;
  leadSource: LeadSource;
  priority: LeadPriority;
  leadStatus: LeadStatus;
  assignedToId?: string;
  assignedToName?: string;
  dealCurrency: string;
  dealValue?: number;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  description?: string;
  internalNotes?: string;
  tags: string[];
  notes: CrmNote[];
  followUps: CrmFollowUp[];
  attachments: CrmAttachment[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CrmLeadInput {
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  gender?: string;
  dateOfBirth?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  whatsapp?: string;
  website?: string;
  company: string;
  jobTitle?: string;
  industry?: string;
  companySize?: string;
  gstNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  leadType: LeadType;
  leadSource: LeadSource;
  priority: LeadPriority;
  leadStatus: LeadStatus;
  assignedToId?: string;
  dealCurrency: string;
  dealValue?: number;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  description?: string;
  internalNotes?: string;
  tags: string[];
}

export interface CrmSummary {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  todaysFollowUps: number;
}

export type CrmSortOption = 'newest' | 'oldest' | 'priority' | 'updated';

export interface CrmFilters {
  search: string;
  leadStatus: LeadStatus | 'all';
  leadType: LeadType | 'all';
  priority: LeadPriority | 'all';
  assignedToId: string | 'all';
  source: LeadSource | 'all';
  dateFrom: string;
  dateTo: string;
  sort: CrmSortOption;
}
