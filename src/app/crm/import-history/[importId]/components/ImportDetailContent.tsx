'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { crmService, formatLeadDate } from '@/src/lib/crm/crmService';
import { downloadCsvFile } from '@/src/lib/crm/importParser';

interface ImportDetailContentProps {
  importId: string;
}

export default function ImportDetailContent({ importId }: ImportDetailContentProps) {
  const [job, setJob] = useState<Awaited<ReturnType<typeof crmService.getImportJob>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmService
      .getImportJob(importId)
      .then(setJob)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load import'))
      .finally(() => setLoading(false));
  }, [importId]);

  const downloadErrors = async () => {
    try {
      const csv = await crmService.getImportJob(importId).then((j) => {
        const lines = ['Row Number,Error,Suggested Fix'];
        for (const e of j.errors) {
          lines.push(`${e.rowNumber},"${e.error.replace(/"/g, '""')}","${(e.suggestedFix ?? '').replace(/"/g, '""')}"`);
        }
        return lines.join('\n');
      });
      downloadCsvFile(csv, `import-errors-${importId}.csv`);
    } catch {
      toast.error('Failed to download errors');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={32} className="animate-spin text-violet-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p>Import job not found.</p>
        <Link href="/crm/import-history" className="text-violet-600 text-sm mt-2 inline-block">← Back</Link>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-6 min-w-0">
        <Link href="/crm/import-history" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 break-all">{job.fileName}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Uploaded by {job.uploadedBy} · {formatLeadDate(job.uploadedDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={job.totalRecords} />
        <Stat label="Successful" value={job.successfulRecords} color="text-emerald-600" />
        <Stat label="Duplicates" value={job.duplicateRecords} color="text-blue-600" />
        <Stat label="Failed" value={job.failedRecords} color="text-red-600" />
      </div>

      {job.errors.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Errors ({job.errors.length})</h2>
            <button
              type="button"
              onClick={() => void downloadErrors()}
              className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
            >
              <Download size={14} /> Download CSV
            </button>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-600">Row</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-600">Error</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-600 hidden md:table-cell">Fix</th>
                </tr>
              </thead>
              <tbody>
                {job.errors.map((e) => (
                  <tr key={e.rowNumber} className="border-t border-slate-50">
                    <td className="px-4 py-2">{e.rowNumber}</td>
                    <td className="px-4 py-2 text-red-600">{e.error}</td>
                    <td className="px-4 py-2 text-slate-500 hidden md:table-cell">{e.suggestedFix ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color = 'text-slate-800' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500 uppercase mt-1">{label}</p>
    </div>
  );
}
