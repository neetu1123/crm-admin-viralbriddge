'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { crmService } from '@/src/lib/crm/crmService';
import type { ImportHistoryItem } from '@/src/lib/crm/types';
import { formatLeadDate } from '@/src/lib/crm/crmService';

export default function ImportHistoryContent() {
  const [items, setItems] = useState<ImportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmService
      .getImportHistory()
      .then(setItems)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load import history'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 mb-6 min-w-0">
        <Link href="/crm" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Import History</h1>
          <p className="text-slate-500 text-sm mt-0.5">Past lead import jobs</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-violet-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FileSpreadsheet size={40} className="mx-auto mb-3 text-slate-300" />
          <p>No imports yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">File</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Imported By</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Rows</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/crm/import-history/${item.id}`} className="font-medium text-violet-600 hover:underline break-all">
                      {item.fileName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{item.importedBy}</td>
                  <td className="px-4 py-3 text-slate-500">{formatLeadDate(item.date)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.imported} ok · {item.duplicates} dup · {item.failed} fail
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{item.status}</span>
                  </td>
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
