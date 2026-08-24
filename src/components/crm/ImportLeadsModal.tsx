'use client';

import React, { useState } from 'react';
import { Loader2, Upload, X, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ImportPreviewResult } from '@/src/lib/crm/types';
import { crmService } from '@/src/lib/crm/crmService';
import { downloadImportTemplate, parseCsvText } from '@/src/lib/crm/importParser';

interface ImportLeadsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'upload' | 'preview' | 'confirm';

export default function ImportLeadsModal({ open, onClose, onSuccess }: ImportLeadsModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'SKIP' | 'UPDATE' | 'IMPORT_AS_NEW'>('SKIP');

  const reset = () => {
    setStep('upload');
    setFileName('');
    setPreview(null);
    setDuplicateStrategy('SKIP');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(csv|txt)$/i)) {
      toast.error('Please upload a CSV file');
      return;
    }
    setLoading(true);
    try {
      const text = await file.text();
      const rows = parseCsvText(text);
      if (!rows.length) {
        toast.error('No data rows found in file');
        return;
      }
      setFileName(file.name);
      const result = await crmService.importPreview(file.name, rows);
      setPreview(result);
      setStep('preview');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const result = await crmService.importConfirm(preview.importJobId, duplicateStrategy);
      toast.success(`Imported ${result.imported} leads (${result.duplicates} duplicates, ${result.failed} failed)`);
      onSuccess();
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-semibold text-slate-800">Import Leads</h2>
          <button type="button" onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {step === 'upload' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={downloadImportTemplate}
                className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
              >
                <Download size={16} /> Download CSV template
              </button>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 sm:p-10 cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors">
                <Upload size={32} className="text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700">Drop CSV file or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">Supports .csv files</p>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFile(f);
                  }}
                />
              </label>
              {loading && (
                <div className="flex justify-center">
                  <Loader2 size={24} className="animate-spin text-violet-600" />
                </div>
              )}
            </div>
          )}

          {step === 'preview' && preview && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                File: <span className="font-medium">{fileName}</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatBox label="Valid" value={preview.valid} color="text-emerald-600" />
                <StatBox label="Warnings" value={preview.warnings} color="text-amber-600" />
                <StatBox label="Duplicates" value={preview.duplicates} color="text-blue-600" />
                <StatBox label="Errors" value={preview.errors} color="text-red-600" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Duplicate strategy</label>
                <select
                  value={duplicateStrategy}
                  onChange={(e) => setDuplicateStrategy(e.target.value as typeof duplicateStrategy)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="SKIP">Skip duplicates</option>
                  <option value="UPDATE">Update existing</option>
                  <option value="IMPORT_AS_NEW">Import as new</option>
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-auto">
                <table className="w-full text-xs min-w-[360px]">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Row</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row) => (
                      <tr key={row.rowNumber} className="border-t border-slate-100">
                        <td className="px-3 py-2">{row.rowNumber}</td>
                        <td className="px-3 py-2">{row.firstName} {row.lastName}</td>
                        <td className="px-3 py-2">{row.email || row.phone}</td>
                        <td className="px-3 py-2">
                          <StatusChip status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.errors > 0 && (
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <AlertCircle size={14} /> Rows with errors will be skipped during import.
                </p>
              )}
            </div>
          )}
        </div>

        {step === 'preview' && preview && (
          <div className="flex flex-col-reverse sm:flex-row gap-2 px-5 py-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => { setStep('upload'); setPreview(null); }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={loading || preview.valid + preview.warnings + preview.duplicates === 0}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 text-center"
            >
              {loading ? 'Importing…' : `Confirm Import (${preview.valid + preview.warnings + preview.duplicates} rows)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500 uppercase">{label}</p>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const colors: Record<string, string> = {
    VALID: 'bg-emerald-100 text-emerald-700',
    WARNING: 'bg-amber-100 text-amber-700',
    ERROR: 'bg-red-100 text-red-700',
    DUPLICATE: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[status] ?? 'bg-slate-100'}`}>
      {status === 'VALID' && <CheckCircle2 size={10} />}
      {status}
    </span>
  );
}
