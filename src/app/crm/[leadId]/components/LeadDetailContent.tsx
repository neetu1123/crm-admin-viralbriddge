'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  UserCheck,
  Archive,
  Trash2,
  Building2,
  Globe,
  MapPin,
  FileText,
  Paperclip,
  Loader2,
  Pencil,
} from 'lucide-react';
import { useAuth } from '@/src/lib/useAuth';
import {
  crmService,
  formatDealValue,
  formatLeadDate,
  getLeadFullName,
} from '@/src/lib/crm/crmService';
import type { CrmLead } from '@/src/lib/crm/types';
import LeadStatusBadge from '@/src/components/crm/LeadStatusBadge';
import PriorityBadge from '@/src/components/crm/PriorityBadge';
import Timeline from '@/src/components/crm/Timeline';
import NotesPanel from '@/src/components/crm/NotesPanel';
import FollowUpWidget from '@/src/components/crm/FollowUpWidget';
import ActivityTimeline from '@/src/components/crm/ActivityTimeline';
import AssignAgentModal from '@/src/components/crm/AssignAgentModal';
import type { AssignmentHistoryEntry } from '@/src/lib/crm/types';

type TabId = 'overview' | 'timeline' | 'notes' | 'activities' | 'attachments' | 'communication' | 'followups';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notes', label: 'Notes' },
  { id: 'activities', label: 'Activities' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'communication', label: 'Communication' },
  { id: 'followups', label: 'Follow-ups' },
];

interface LeadDetailContentProps {
  leadId: string;
}

export default function LeadDetailContent({ leadId }: LeadDetailContentProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [lead, setLead] = useState<CrmLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistoryEntry[]>([]);

  const loadLead = useCallback(async () => {
    setLoading(true);
    try {
      const [data, history] = await Promise.all([
        crmService.getLeadById(leadId),
        crmService.getAssignmentHistory(leadId).catch(() => []),
      ]);
      setLead(data ?? null);
      setAssignmentHistory(history);
    } catch {
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleArchive = async () => {
    if (!lead) return;
    try {
      await crmService.archiveLead(lead.id, user?.name);
      toast.success('Lead archived');
      loadLead();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to archive lead');
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (!confirm(`Delete ${getLeadFullName(lead)}?`)) return;
    try {
      await crmService.deleteLead(lead.id);
      toast.success('Lead deleted');
      router.push('/crm');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600 mb-4">Lead not found.</p>
        <Link href="/crm" className="text-violet-600 font-semibold text-sm hover:underline">
          ← Back to CRM
        </Link>
      </div>
    );
  }

  const initials = `${lead.firstName[0] ?? ''}${lead.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="pb-8">
      <Toaster position="bottom-right" richColors />

      <Link href="/crm" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 mb-4">
        <ArrowLeft size={16} /> Back to CRM
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{getLeadFullName(lead)}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <Building2 size={14} /> {lead.company}
                {lead.jobTitle ? ` · ${lead.jobTitle}` : ''}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <LeadStatusBadge status={lead.leadStatus} />
                <PriorityBadge priority={lead.priority} />
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{lead.leadType}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">
              <Phone size={14} /> Call
            </a>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              <Mail size={14} /> Email
            </a>
            {lead.whatsapp && (
              <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
            <button type="button" onClick={() => setActiveTab('followups')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100">
              <Calendar size={14} /> Schedule Meeting
            </button>
            <button type="button" onClick={() => toast.info('Convert to Brand — API integration coming soon')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100">
              <UserCheck size={14} /> Convert to Brand
            </button>
            <button type="button" onClick={() => toast.info('Convert to Creator — API integration coming soon')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
              <UserCheck size={14} /> Convert to Creator
            </button>
            <button type="button" onClick={() => setShowReassignModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100">
              <UserCheck size={14} /> Reassign
            </button>
            <Link href={`/crm/${lead.id}/edit`} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
              <Pencil size={14} /> Edit
            </Link>
            <button type="button" onClick={handleArchive} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100">
              <Archive size={14} /> Archive
            </button>
            <button type="button" onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto mb-6 pb-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-violet-700 border border-b-0 border-slate-200 -mb-px'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoCard title="Contact">
                <InfoRow icon={Mail} label="Email" value={lead.email} />
                <InfoRow icon={Phone} label="Phone" value={lead.phone} />
                {lead.alternatePhone && <InfoRow icon={Phone} label="Alt Phone" value={lead.alternatePhone} />}
                {lead.whatsapp && <InfoRow icon={MessageCircle} label="WhatsApp" value={lead.whatsapp} />}
                {lead.website && (
                  <InfoRow icon={Globe} label="Website" value={lead.website} href={lead.website} />
                )}
              </InfoCard>
              <InfoCard title="Company">
                <InfoRow icon={Building2} label="Company" value={lead.company} />
                {lead.industry && <InfoRow label="Industry" value={lead.industry} />}
                {lead.companySize && <InfoRow label="Company Size" value={lead.companySize} />}
                {lead.gstNumber && <InfoRow label="GST" value={lead.gstNumber} />}
              </InfoCard>
              {(lead.city || lead.country) && (
                <InfoCard title="Address">
                  <InfoRow icon={MapPin} label="Location" value={[lead.city, lead.state, lead.country].filter(Boolean).join(', ')} />
                  {lead.address && <InfoRow label="Address" value={lead.address} />}
                </InfoCard>
              )}
            </div>
            <div className="space-y-4">
              <InfoCard title="Lead Details">
                <InfoRow label="Source" value={lead.leadSource} />
                <InfoRow label="Assigned To" value={lead.assignedToName ?? 'Unassigned'} />
                <InfoRow label="Deal Value" value={formatDealValue(lead.dealCurrency, lead.dealValue)} />
                <InfoRow label="Created" value={formatLeadDate(lead.createdAt)} />
                <InfoRow label="Last Updated" value={formatLeadDate(lead.updatedAt)} />
                {lead.nextFollowUpDate && (
                  <InfoRow label="Next Follow-up" value={`${formatLeadDate(lead.nextFollowUpDate)}${lead.nextFollowUpTime ? ` at ${lead.nextFollowUpTime}` : ''}`} />
                )}
              </InfoCard>
              {lead.description && (
                <InfoCard title="Description">
                  <p className="text-sm text-slate-600 leading-relaxed">{lead.description}</p>
                </InfoCard>
              )}
              {lead.internalNotes && (
                <InfoCard title="Internal Notes">
                  <p className="text-sm text-slate-600 leading-relaxed">{lead.internalNotes}</p>
                </InfoCard>
              )}
              {lead.tags.length > 0 && (
                <InfoCard title="Tags">
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </InfoCard>
              )}
              {assignmentHistory.length > 0 && (
                <InfoCard title="Assignment History">
                  <div className="space-y-3">
                    {assignmentHistory.map((entry) => (
                      <div key={entry.id} className="text-sm border-l-2 border-violet-200 pl-3">
                        <p className="text-slate-800">
                          {entry.previousAgentName ? `${entry.previousAgentName} → ` : ''}
                          {entry.newAgentName ?? 'Unassigned'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {entry.assignmentType.replace(/_/g, ' ')} · {entry.assignedByName ?? 'System'} · {formatLeadDate(entry.createdAt)}
                        </p>
                        {entry.reason && <p className="text-xs text-slate-500 italic mt-0.5">{entry.reason}</p>}
                      </div>
                    ))}
                  </div>
                </InfoCard>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <Timeline events={lead.timeline} />
          </div>
        )}

        {activeTab === 'notes' && (
          <NotesPanel
            notes={lead.notes}
            onAdd={async (content) => {
              try {
                await crmService.addNote(lead.id, content, user?.name ?? 'Admin');
                toast.success('Note added');
                loadLead();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to add note');
              }
            }}
            onEdit={async (noteId, content) => {
              try {
                await crmService.updateNote(lead.id, noteId, content);
                toast.success('Note updated');
                loadLead();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to update note');
              }
            }}
            onDelete={async (noteId) => {
              try {
                await crmService.deleteNote(lead.id, noteId);
                toast.success('Note deleted');
                loadLead();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to delete note');
              }
            }}
          />
        )}

        {activeTab === 'activities' && (
          <ActivityTimeline events={lead.timeline} />
        )}

        {activeTab === 'attachments' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {lead.attachments.length === 0 ? (
              <div className="py-12 text-center">
                <Paperclip size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No attachments yet.</p>
                <p className="text-xs text-slate-400 mt-1">File uploads will be available with backend integration.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lead.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <FileText size={18} className="text-violet-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{att.name}</p>
                      <p className="text-xs text-slate-400">{att.size} · {formatLeadDate(att.uploadedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-500 mb-4">Communication history from timeline events.</p>
            <Timeline
              events={lead.timeline.filter((e) =>
                ['email_sent', 'call_scheduled', 'meeting_added'].includes(e.type),
              )}
            />
            {!lead.timeline.some((e) => ['email_sent', 'call_scheduled', 'meeting_added'].includes(e.type)) && (
              <p className="text-sm text-slate-400 text-center py-8">No communication records yet.</p>
            )}
          </div>
        )}

        {activeTab === 'followups' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <FollowUpWidget
              followUps={lead.followUps}
              onAdd={async (data) => {
                try {
                  await crmService.addFollowUp(lead.id, data);
                  toast.success('Follow-up scheduled');
                  loadLead();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to schedule follow-up');
                }
              }}
              onComplete={async (followUpId) => {
                try {
                  await crmService.completeFollowUp(lead.id, followUpId);
                  toast.success('Follow-up completed');
                  loadLead();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to complete follow-up');
                }
              }}
            />
          </div>
        )}
      </div>

      <AssignAgentModal
        open={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Reassign Lead"
        leadCount={1}
        onConfirm={async (agentId) => {
          const reason = prompt('Reason for reassignment (optional):') ?? undefined;
          try {
            const result = await crmService.reassignLead(lead.id, agentId, reason);
            toast.success(`Reassigned to ${result.assignedTo}`);
            loadLead();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Reassignment failed');
            throw err;
          }
        }}
      />
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />}
      <span className="text-slate-500 min-w-[100px]">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline break-all">
          {value}
        </a>
      ) : (
        <span className="text-slate-800 break-all">{value}</span>
      )}
    </div>
  );
}
