'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Download, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { crmService, formatLeadDate } from '@/src/lib/crm/crmService';
import { downloadCsvFile } from '@/src/lib/crm/importParser';
import type { ExportHistoryItem } from '@/src/lib/crm/types';

export default function ExportHistoryContent() {
  const [items, setItems] = useState<ExportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmService
      .getExportHistory()
      .then(setItems)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load export history'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const { csv } = await crmService.getExportDownload(id);
      downloadCsvFile(csv, fileName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    }
  };

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/crm" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Export History</h1>
          <p className="text-slate-500 text-sm mt-0.5">Past lead export jobs</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-violet-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileDown size={40} className="mx-auto mb-3 text-slate-300" />
          <p>No exports yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">File</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Requested By</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Records</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Download</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.fileName}</td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{item.requestedBy}</td>
                  <td className="px-4 py-3 text-slate-500">{formatLeadDate(item.date)}</td>
                  <td className="px-4 py-3 text-slate-600">{item.recordCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void handleDownload(item.id, item.fileName)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700"
                    >
                      <Download size={14} /> CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
