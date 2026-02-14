'use client';

import { useState } from 'react';
import { Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatEntryDate } from '@/lib/helpers';
import type { RecruiterNote } from '@/types/recruiter';

interface NotesSectionProps {
  notes: RecruiterNote[];
  onAdd: (text: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

export function NotesSection({ notes, onAdd, onDelete }: NotesSectionProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onAdd(text.trim());
      setText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Notes</h4>

      {/* Add note form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note..."
          className="input-base flex-1 px-3 py-2 rounded-lg text-sm"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!text.trim() || loading}
          className="px-3"
        >
          <Send size={14} />
        </Button>
      </form>

      {/* Notes list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] py-2">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-[var(--bg-surface-2)] rounded-lg p-4 group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-[var(--text-secondary)] flex-1">
                  {note.text}
                </p>
                <button
                  onClick={() => onDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--error)] transition-all cursor-pointer p-1"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-[var(--text-muted)]">{note.author}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatEntryDate(note.created_at, true)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
