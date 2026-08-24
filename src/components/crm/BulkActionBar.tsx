'use client';

import React from 'react';
import { UserPlus, RefreshCw, Tag, Download, Trash2, X, Zap } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  totalMatching?: number;
  selectAllMatching?: boolean;
  onSelectAllMatching?: () => void;
  onClearSelection: () => void;
  onAssign: () => void;
  onAutoAssign: () => void;
  onChangeStatus: () => void;
  onChangePriority: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export default function BulkActionBar({
  selectedCount,
  totalMatching,
  selectAllMatching,
  onSelectAllMatching,
  onClearSelection,
  onAssign,
  onAutoAssign,
  onChangeStatus,
  onChangePriority,
  onExport,
  onDelete,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-3 sm:bottom-4 z-20 mx-auto max-w-4xl px-0">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 bg-slate-900 text-white px-3 sm:px-4 py-3 rounded-2xl shadow-lg">
        <span className="text-sm font-medium sm:mr-2">
          {selectAllMatching && totalMatching
            ? `All ${totalMatching} matching leads selected`
            : `${selectedCount} selected`}
        </span>

        {!selectAllMatching && totalMatching && totalMatching > selectedCount && onSelectAllMatching && (
          <button
            type="button"
            onClick={onSelectAllMatching}
            className="text-xs text-violet-300 hover:text-violet-200 underline sm:mr-2 text-left"
          >
            Select all {totalMatching} matching
          </button>
        )}

        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          <ActionBtn icon={UserPlus} label="Assign" onClick={onAssign} />
          <ActionBtn icon={Zap} label="Auto Assign" onClick={onAutoAssign} />
          <ActionBtn icon={RefreshCw} label="Status" onClick={onChangeStatus} />
          <ActionBtn icon={Tag} label="Priority" onClick={onChangePriority} />
          <ActionBtn icon={Download} label="Export" onClick={onExport} />
          <ActionBtn icon={Trash2} label="Delete" onClick={onDelete} danger />
          <button
            type="button"
            onClick={onClearSelection}
            className="p-2 rounded-lg hover:bg-white/10 ml-1"
            aria-label="Clear selection"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        danger ? 'hover:bg-red-500/20 text-red-300' : 'hover:bg-white/10'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
