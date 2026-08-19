import React from 'react';
import Link from 'next/link';
import { Users, Plus } from 'lucide-react';

export default function CrmEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <Users size={36} className="text-violet-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">No CRM records available.</h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-6">
        Start building your pipeline by adding your first lead. Track communication, follow-ups, and conversions all in one place.
      </p>
      <Link
        href="/crm/new"
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
      >
        <Plus size={16} />
        Create First Lead
      </Link>
    </div>
  );
}
