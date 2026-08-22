'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  CalendarClock,
  Upload,
  Download,
} from 'lucide-react';
import { useAuth } from '@/src/lib/useAuth';
import { crmService, formatLeadDate, getLeadFullName } from '@/src/lib/crm/crmService';
import type { CrmAgent, CrmFilters, CrmLead, CrmSummary } from '@/src/lib/crm/types';
import {
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  LEAD_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
} from '@/src/lib/crm/mockData';
import LeadStatusBadge from '@/src/components/crm/LeadStatusBadge';
import PriorityBadge from '@/src/components/crm/PriorityBadge';
import CrmEmptyState from '@/src/components/crm/CrmEmptyState';
import BulkActionBar from '@/src/components/crm/BulkActionBar';
import AssignAgentModal from '@/src/components/crm/AssignAgentModal';
import ImportLeadsModal from '@/src/components/crm/ImportLeadsModal';
import ExportLeadsModal from '@/src/components/crm/ExportLeadsModal';

const PAGE_SIZE = 8;

const defaultFilters: CrmFilters = {
  search: '',
  leadStatus: 'all',
  leadType: 'all',
  priority: 'all',
  assignedToId: 'all',
  source: 'all',
  dateFrom: '',
  dateTo: '',
  sort: 'newest',
};

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-lg" />
      ))}
    </div>
  );
}

export default function CrmDashboardContent() {
  const { loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [agents, setAgents] = useState<CrmAgent[]>([]);
  const [summary, setSummary] = useState<CrmSummary>({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    lostLeads: 0,
    todaysFollowUps: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CrmFilters>(defaultFilters);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [allMatchingIds, setAllMatchingIds] = useState<string[]>([]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const activeFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const [paginated, summaryData, agentList] = await Promise.all([
        crmService.getLeadsPaginated(activeFilters, page, PAGE_SIZE),
        crmService.getSummary(),
        crmService.getAgents(),
      ]);
      setLeads(paginated.data);
      setTotal(paginated.total);
      setTotalPages(paginated.totalPages);
      setSummary(summaryData);
      setAgents(agentList);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load CRM data');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, page]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    setSelectAllMatching(false);
  }, [debouncedSearch, filters]);

  const pageIds = leads.map((l) => l.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const effectiveSelectedIds = selectAllMatching ? allMatchingIds : Array.from(selectedIds);
  const selectedCount = selectAllMatching ? allMatchingIds.length : selectedIds.size;

  const toggleSelect = (id: string) => {
    setSelectAllMatching(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = () => {
    if (allPageSelected) {
      setSelectAllMatching(false);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectAllMatching(false);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleSelectAllMatching = async () => {
    try {
      const ids = await crmService.getLeadIdsByFilters(activeFilters);
      setAllMatchingIds(ids);
      setSelectAllMatching(true);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to select all');
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
    setAllMatchingIds([]);
  };

  const handleDelete = async (lead: CrmLead) => {
    if (!confirm(`Delete ${getLeadFullName(lead)}? This cannot be undone.`)) return;
    try {
      await crmService.deleteLead(lead.id);
      toast.success('Lead deleted');
      loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  const handleBulkDelete = async () => {
    if (!effectiveSelectedIds.length) return;
    if (!confirm(`Delete ${effectiveSelectedIds.length} leads? This cannot be undone.`)) return;
    try {
      await crmService.bulkDelete(effectiveSelectedIds);
      toast.success('Leads deleted');
      clearSelection();
      loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk delete failed');
    }
  };

  const handleBulkAssign = async (agentId: string) => {
    try {
      const result = await crmService.bulkAssign(effectiveSelectedIds, agentId);
      toast.success(`Assigned ${result.count} leads to ${result.assignedTo}`);
      clearSelection();
      loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Assignment failed');
      throw err;
    }
  };

  const handleAutoAssign = async () => {
    if (!effectiveSelectedIds.length) return;
    try {
      const result = await crmService.bulkAutoAssign(effectiveSelectedIds);
      toast.success(`Auto-assigned ${result.count} leads`);
      clearSelection();
      loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Auto assign failed');
    }
  };

  const handleBulkStatus = async () => {
    const status = prompt('Enter new status (e.g. New, Contacted, Qualified):');
    if (!status || !LEAD_STATUS_OPTIONS.includes(status as typeof LEAD_STATUS_OPTIONS[number])) {
      toast.error('Invalid status');
      return;
    }
    try {
      await crmService.bulkUpdate(effectiveSelectedIds, { leadStatus: status });
      toast.success('Status updated');
      clearSelection();
      loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleBulkPriority = async () => {
    const priority = prompt('Enter priority (Low, Medium, High, Critical):');
    if (!priority || !PRIORITY_OPTIONS.includes(priority as typeof PRIORITY_OPTIONS[number])) {
      toast.error('Invalid priority');
      return;
    }
    try {
      await crmService.bulkUpdate(effectiveSelectedIds, { priority });
      toast.success('Priority updated');
      clearSelection();
      loadLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  const summaryCards = [
    { label: 'Total Leads', value: summary.totalLeads, icon: Users, color: 'text-violet-700', bg: 'bg-violet-50' },
    { label: 'New Leads', value: summary.newLeads, icon: Sparkles, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Qualified Leads', value: summary.qualifiedLeads, icon: Target, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { label: 'Converted Leads', value: summary.convertedLeads, icon: Trophy, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Lost Leads', value: summary.lostLeads, icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' },
    { label: "Today's Follow-ups", value: summary.todaysFollowUps, icon: CalendarClock, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  return (
    <div className="pb-24">
      <Toaster position="bottom-right" richColors />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CRM</h1>
          <p className="text-slate-500 text-sm mt-1">Manage leads, follow-ups, and customer relationships</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <Upload size={16} /> Import
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            <Download size={16} /> Export
          </button>
          <Link
            href="/crm/new"
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            <Plus size={16} />
            Add New Lead
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {summaryCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon size={14} className={stat.color} />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide leading-tight">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm -mx-4 px-4 py-3 mb-4 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, phone, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.leadStatus}
              onChange={(e) => setFilters((f) => ({ ...f, leadStatus: e.target.value as CrmFilters['leadStatus'] }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="all">All Status</option>
              {LEAD_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filters.leadType}
              onChange={(e) => setFilters((f) => ({ ...f, leadType: e.target.value as CrmFilters['leadType'] }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="all">All Types</option>
              {LEAD_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value as CrmFilters['priority'] }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="all">All Priority</option>
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={filters.assignedToId}
              onChange={(e) => setFilters((f) => ({ ...f, assignedToId: e.target.value }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="all">All Assignees</option>
              {agents.map((a) => <option key={a.userId} value={a.userId}>{a.name}</option>)}
            </select>
            <select
              value={filters.source}
              onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value as CrmFilters['source'] }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="all">All Sources</option>
              {LEAD_SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              title="From date"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              title="To date"
            />
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as CrmFilters['sort'] }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Highest Priority</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : leads.length === 0 ? (
          <CrmEmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectPage}
                        className="rounded text-violet-600"
                        aria-label="Select all on page"
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Profile</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Full Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Company</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Lead Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden xl:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden xl:table-cell">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Assigned To</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Priority</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">Created</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const initials = `${lead.firstName[0] ?? ''}${lead.lastName[0] ?? ''}`.toUpperCase();
                    const checked = selectAllMatching || selectedIds.has(lead.id);
                    return (
                      <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors animate-fade-in">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(lead.id)}
                            className="rounded text-violet-600"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold">
                            {initials}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/crm/${lead.id}`} className="font-medium text-slate-800 hover:text-violet-600">
                            {getLeadFullName(lead)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{lead.company}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{lead.leadType}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden xl:table-cell truncate max-w-[160px]">{lead.email}</td>
                        <td className="px-4 py-3 text-slate-500 hidden xl:table-cell">{lead.phone}</td>
                        <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">{lead.assignedToName ?? '—'}</td>
                        <td className="px-4 py-3"><LeadStatusBadge status={lead.leadStatus} /></td>
                        <td className="px-4 py-3 hidden md:table-cell"><PriorityBadge priority={lead.priority} /></td>
                        <td className="px-4 py-3 text-slate-500 hidden lg:table-cell whitespace-nowrap">{formatLeadDate(lead.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/crm/${lead.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="View">
                              <Eye size={15} />
                            </Link>
                            <Link href={`/crm/${lead.id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Edit">
                              <Pencil size={15} />
                            </Link>
                            <button type="button" onClick={() => handleDelete(lead)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" aria-label="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-600">{page} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <BulkActionBar
        selectedCount={selectedCount}
        totalMatching={total}
        selectAllMatching={selectAllMatching}
        onSelectAllMatching={() => void handleSelectAllMatching()}
        onClearSelection={clearSelection}
        onAssign={() => setShowAssignModal(true)}
        onAutoAssign={() => void handleAutoAssign()}
        onChangeStatus={() => void handleBulkStatus()}
        onChangePriority={() => void handleBulkPriority()}
        onExport={() => setShowExportModal(true)}
        onDelete={() => void handleBulkDelete()}
      />

      <AssignAgentModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onConfirm={handleBulkAssign}
        leadCount={selectedCount}
      />

      <ImportLeadsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadLeads}
      />

      <ExportLeadsModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        leadIds={effectiveSelectedIds.length ? effectiveSelectedIds : undefined}
        filters={activeFilters}
        totalCount={total}
      />
    </div>
  );
}
