'use client';

import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { crmService } from '@/src/lib/crm/crmService';
import { downloadCsvFile } from '@/src/lib/crm/importParser';
import type { CrmFilters } from '@/src/lib/crm/types';

const EXPORT_FIELDS = [
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'company', label: 'Company' },
  { id: 'leadType', label: 'Lead Type' },
  { id: 'leadSource', label: 'Lead Source' },
  { id: 'leadStatus', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'assignedToName', label: 'Assigned To' },
  { id: 'createdAt', label: 'Created At' },
];

interface ExportLeadsModalProps {
  open: boolean;
  onClose: () => void;
  leadIds?: string[];
  filters?: CrmFilters;
  totalCount?: number;
}

export default function ExportLeadsModal({
  open,
  onClose,
  leadIds,
  filters,
  totalCount,
}: ExportLeadsModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.map((f) => f.id),
  );
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const toggleField = (id: string) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const handleExport = async () => {
    if (!selectedFields.length) {
      toast.error('Select at least one field');
      return;
    }
    setExporting(true);
    try {
      const filterPayload = filters
        ? {
            search: filters.search || undefined,
            leadStatus: filters.leadStatus !== 'all' ? filters.leadStatus : undefined,
            leadType: filters.leadType !== 'all' ? filters.leadType : undefined,
            priority: filters.priority !== 'all' ? filters.priority : undefined,
            assignedToId: filters.assignedToId !== 'all' ? filters.assignedToId : undefined,
            source: filters.source !== 'all' ? filters.source : undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
          }
        : undefined;

      const result = await crmService.exportLeads({
        leadIds: leadIds?.length ? leadIds : undefined,
        filters: filterPayload,
        fields: selectedFields,
      });
      downloadCsvFile(result.csv, `crm-export-${Date.now()}.csv`);
      toast.success(`Exported ${result.recordCount} leads`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const countLabel = leadIds?.length
    ? `${leadIds.length} selected leads`
    : totalCount != null
      ? `${totalCount} matching leads`
      : 'All matching leads';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Export Leads</h2>
            <p className="text-xs text-slate-500 mt-0.5">{countLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 max-h-[50vh] overflow-y-auto">
          <p className="text-sm font-medium text-slate-700 mb-3">Select fields to export</p>
          <div className="space-y-2">
            {EXPORT_FIELDS.map((field) => (
              <label key={field.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.id)}
                  onChange={() => toggleField(field.id)}
                  className="rounded text-violet-600"
                />
                {field.label}
              </label>
            ))}
          </div>
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
            onClick={() => void handleExport()}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
