'use client';

import { useState } from 'react';
import { Send, Trash2, Building2, Plus, ArrowRight } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { formatEntryDate } from '@/lib/helpers';
import { STATUS_PILL_COLORS } from '@/lib/constants';
import { toActivityEntry } from '@/types/recruiter';
import type {
  RecruiterCandidateView,
  ActivityEntry,
  CandidateSubmission,
  SubmissionStatus,
  SubmissionCompany,
} from '@/types/recruiter';

const SUBMISSION_STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'placed', label: 'Placed' },
];

interface CandidatePipelineProps {
  candidate: RecruiterCandidateView;
  submissions: CandidateSubmission[];
  companies: SubmissionCompany[];
  onAddNote: (text: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onCreateSubmission: (companyId: string, submittedBy: string, notes: string) => Promise<void>;
  onUpdateSubmission: (submissionId: string, status: SubmissionStatus) => Promise<void>;
  onDeleteSubmission: (submissionId: string) => Promise<void>;
  onCompanyAdded?: (company: SubmissionCompany) => void;
}

function dotColor(entry: ActivityEntry): string {
  switch (entry.type) {
    case 'note': return 'var(--text-tertiary)';
    case 'status_change': return 'var(--status-new)';
    case 'submission_created': return 'var(--status-placed)';
    case 'submission_update': {
      const to = entry.to;
      if (to === 'placed') return 'var(--status-placed)';
      if (to === 'rejected') return 'var(--status-rejected)';
      if (to === 'interviewing') return 'var(--status-interviewing)';
      return 'var(--text-tertiary)';
    }
  }
}

const deleteBtn = (id: string, onDelete: (id: string) => Promise<void>) => (
  <button onClick={() => onDelete(id)}
    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5 ml-auto"
    style={{ color: 'var(--text-tertiary)' }}
    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--error)'; }}
    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-tertiary)'; }}
    aria-label="Delete entry">
    <Trash2 size={11} />
  </button>
);

function renderEntry(
  entry: ActivityEntry,
  onDeleteNote: (noteId: string) => Promise<void>,
) {
  const date = formatEntryDate(entry.created_at, true);
  const author = entry.author;
  const metaStyle = { fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '1px' };

  switch (entry.type) {
    case 'note':
      return (
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{entry.text}</p>
          <div className="flex items-center gap-2" style={metaStyle}>
            <span>{date}</span>
            {author && <><span>&bull;</span><span>{author}</span></>}
            {deleteBtn(entry.id, onDeleteNote)}
          </div>
        </div>
      );
    case 'status_change':
      return (
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span>Status:</span>
            <span style={{ textTransform: 'capitalize' }}>{entry.from}</span>
            <ArrowRight size={11} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{entry.to}</span>
          </p>
          {entry.comment && (
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', fontStyle: 'italic' }}>&ldquo;{entry.comment}&rdquo;</p>
          )}
          <div className="flex items-center gap-2" style={metaStyle}>
            <span>{date}</span>
            {author && <><span>&bull;</span><span>{author}</span></>}
            {deleteBtn(entry.id, onDeleteNote)}
          </div>
        </div>
      );
    case 'submission_created':
      return (
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
            Submitted to <span style={{ fontWeight: 500 }}>{entry.company_name}</span>
          </p>
          <div className="flex items-center gap-2" style={metaStyle}>
            <span>{date}</span>
            {author && <><span>&bull;</span><span>{author}</span></>}
            {deleteBtn(entry.id, onDeleteNote)}
          </div>
        </div>
      );
    case 'submission_update':
      return (
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 500 }}>{entry.company_name}:</span>
            <span style={{ textTransform: 'capitalize' }}>{entry.from}</span>
            <ArrowRight size={11} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{entry.to}</span>
          </p>
          <div className="flex items-center gap-2" style={metaStyle}>
            <span>{date}</span>
            {author && <><span>&bull;</span><span>{author}</span></>}
            {deleteBtn(entry.id, onDeleteNote)}
          </div>
        </div>
      );
  }
}

export function CandidatePipeline({
  candidate,
  submissions,
  companies,
  onAddNote,
  onDeleteNote,
  onCreateSubmission,
  onUpdateSubmission,
  onDeleteSubmission,
  onCompanyAdded,
}: CandidatePipelineProps) {
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [submittedBy, setSubmittedBy] = useState(candidate.owner || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [addingCompany, setAddingCompany] = useState(false);

  const submittedCompanyIds = new Set(submissions.map((s) => s.company_id));
  const availableCompanies = companies.filter((c) => !submittedCompanyIds.has(c.id));

  const entries = [...(candidate.notes || [])]
    .map(toActivityEntry)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = noteText.trim();
    if (!text) return;
    setAddingNote(true);
    try {
      await onAddNote(text);
      setNoteText('');
    } finally {
      setAddingNote(false);
    }
  };

  const handleAddCompany = async () => {
    const name = newCompanyName.trim();
    if (!name) return;
    setAddingCompany(true);
    try {
      const res = await fetch('/api/submission-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast('error', data.error || 'Failed to add company');
        return;
      }
      const { company } = await res.json();
      onCompanyAdded?.(company);
      setSelectedCompanyId(company.id);
      setNewCompanyName('');
      toast('success', `Added ${company.name}`);
    } catch {
      toast('error', 'Failed to add company');
    } finally {
      setAddingCompany(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setSubmitting(true);
    try {
      await onCreateSubmission(selectedCompanyId, submittedBy.trim(), notes.trim());
      setSelectedCompanyId('');
      setNotes('');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteSubmission(deleteTarget);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      {(
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Pipeline &amp; Activity</h4>
        </div>
      )}

      {/* Active submissions */}
      {submissions.length > 0 && (
        <div className="space-y-2">
          {submissions.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-3 py-2.5 bg-[var(--bg-nested)] border border-[var(--border-subtle)] rounded-lg group">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[var(--text-primary)]">{s.company_name}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Submitted {formatEntryDate(s.submitted_at, true)}
                  {s.submitted_by && <> &bull; by {s.submitted_by}</>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={s.status}
                  onChange={(e) => onUpdateSubmission(s.id, e.target.value as SubmissionStatus)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer border-none"
                  style={{
                    background: STATUS_PILL_COLORS[s.status]?.bg,
                    color: STATUS_PILL_COLORS[s.status]?.text,
                  }}
                  aria-label={`Update status for ${s.company_name}`}
                >
                  {SUBMISSION_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setDeleteTarget(s.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--error)] transition-all cursor-pointer p-1"
                  aria-label={`Remove submission to ${s.company_name}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit to company button / form */}
      {(showForm ? (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-nested)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '12px' }} className="space-y-2.5">
          <div>
            <label style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Company</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="input-base w-full px-2.5 py-1.5 rounded-md text-xs cursor-pointer"
              required
            >
              <option value="">Select company...</option>
              {availableCompanies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 mt-1.5">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCompany(); } }}
                placeholder="Or add new company..."
                className="input-base flex-1 px-2.5 py-1.5 rounded-md text-xs"
              />
              <button
                type="button"
                onClick={handleAddCompany}
                disabled={!newCompanyName.trim() || addingCompany}
                style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', cursor: 'pointer' }}
                className="disabled:opacity-40"
              >
                <Plus size={11} className="inline mr-0.5" />Add
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Submitted by</label>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="Recruiter name..."
              className="input-base w-full px-2.5 py-1.5 rounded-md text-xs"
            />
          </div>
          <div>
            <label style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. VP Finance role, Zurich office"
              className="input-base w-full px-2.5 py-1.5 rounded-md text-xs"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button type="submit" disabled={!selectedCompanyId || submitting}
              style={{ fontSize: '11px', fontWeight: 500, padding: '5px 14px', borderRadius: '6px', background: 'var(--primary)', border: '1px solid var(--primary-hover)', color: 'var(--text-primary)', cursor: 'pointer' }}
              className="disabled:opacity-50 flex items-center gap-1.5">
              <Send size={12} />
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setSelectedCompanyId(''); setNotes(''); }}
              style={{ fontSize: '11px', padding: '5px 12px', color: 'var(--text-secondary)', cursor: 'pointer', background: 'transparent', border: 'none' }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => { setSubmittedBy(candidate.owner || ''); setShowForm(true); }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 500, padding: '6px 14px', borderRadius: '6px', background: 'var(--primary)', border: '1px solid var(--primary-hover)', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <Building2 size={12} />
          Submit to Company
        </button>
      ))}

      {/* Add note form */}
      <form onSubmit={handleAddNote} className="flex gap-2 mb-3">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note..."
          className="input-base flex-1 px-2.5 py-1.5 rounded-md text-xs"
        />
        <button type="submit" disabled={!noteText.trim() || addingNote}
          style={{ padding: '5px 12px', borderRadius: '6px', background: 'var(--primary)', border: '1px solid var(--primary-hover)', color: 'var(--text-primary)', cursor: 'pointer' }}
          className="disabled:opacity-50">
          <Send size={12} />
        </button>
      </form>

      {/* Activity timeline */}
      {entries.length > 0 && (
        <div style={{ borderLeft: '2px solid var(--border-strong)', paddingLeft: '14px' }}>
          {entries.map((entry) => (
            <div key={entry.id} className="group" style={{ marginBottom: '14px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-19px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: dotColor(entry) }} />
              {renderEntry(entry, onDeleteNote)}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Submission"
        message="Remove this submission record? This cannot be undone."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
