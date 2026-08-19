'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import type { CrmNote } from '@/src/lib/crm/types';
import { formatLeadDate } from '@/src/lib/crm/crmService';

interface NotesPanelProps {
  notes: CrmNote[];
  onAdd: (content: string) => void;
  onEdit: (noteId: string, content: string) => void;
  onDelete: (noteId: string) => void;
}

export default function NotesPanel({ notes, onAdd, onEdit, onDelete }: NotesPanelProps) {
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    if (!newNote.trim()) return;
    onAdd(newNote.trim());
    setNewNote('');
  };

  const startEdit = (note: CrmNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const saveEdit = () => {
    if (editingId && editContent.trim()) {
      onEdit(editingId, editContent.trim());
    }
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add an internal note..."
          rows={3}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newNote.trim()}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4 animate-fade-in">
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
                  />
                  <div className="flex gap-2 mt-2 justify-end">
                    <button type="button" onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                      <X size={16} />
                    </button>
                    <button type="button" onClick={saveEdit} className="p-1.5 rounded-lg hover:bg-violet-100 text-violet-600">
                      <Save size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      {note.createdBy} · {formatLeadDate(note.createdAt)}
                      {note.updatedAt ? ' (edited)' : ''}
                    </p>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => startEdit(note)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Edit note">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => onDelete(note.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" aria-label="Delete note">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
