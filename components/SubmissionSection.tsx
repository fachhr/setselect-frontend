'use client';

import { useState } from 'react';
import { Send, Trash2, Building2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatEntryDate } from '@/lib/helpers';
import { toast } from '@/components/ui/Toast';
import type { CandidateSubmission, SubmissionStatus, SubmissionCompany } from '@/types/recruiter';

const SUBMISSION_STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'placed', label: 'Placed' },
];

const statusVariant: Record<SubmissionStatus, 'blue' | 'gold' | 'error' | 'success'> = {
  submitted: 'blue',
  interviewing: 'gold',
  rejected: 'error',
  placed: 'success',
};

interface SubmissionSectionProps {
  submissions: CandidateSubmission[];
  companies: SubmissionCompany[];
  candidateOwner: string | null;
  onCreateSubmission: (companyId: string, submittedBy: string, notes: string) => Promise<void>;
  onUpdateSubmission: (submissionId: string, status: SubmissionStatus) => Promise<void>;
  onDeleteSubmission: (submissionId: string) => Promise<void>;
  onCompanyAdded?: (company: SubmissionCompany) => void;
}

export function SubmissionSection({
  submissions,
  companies,
  candidateOwner,
  onCreateSubmission,
  onUpdateSubmission,
  onDeleteSubmission,
  onCompanyAdded,
}: SubmissionSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [submittedBy, setSubmittedBy] = useState(candidateOwner || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [addingCompany, setAddingCompany] = useState(false);

  // Filter out companies that already have a submission
  const submittedCompanyIds = new Set(submissions.map((s) => s.company_id));
  const availableCompanies = companies.filter((c) => !submittedCompanyIds.has(c.id));

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-[var(--text-muted)]" />
          <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
            Submissions {submissions.length > 0 && `(${submissions.length})`}
          </h4>
        </div>
      </div>

      {/* Submissions list */}
      <div className="space-y-2">
        {submissions.length === 0 && !showForm ? (
          <p className="text-xs text-[var(--text-muted)] py-2">Not submitted to any company yet</p>
        ) : (
          submissions.map((s) => (
            <div
              key={s.id}
              className="bg-[var(--bg-surface-2)] rounded-lg p-3 border border-[var(--border-subtle)] group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {s.company_name}
                    </span>
                    <Badge variant={statusVariant[s.status]}>
                      {SUBMISSION_STATUSES.find((st) => st.value === s.status)?.label}
                    </Badge>
                  </div>
                  {s.notes && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1 italic">
                      &ldquo;{s.notes}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--text-muted)]">
                    <span>{formatEntryDate(s.submitted_at, true)}</span>
                    {s.submitted_by && (
                      <>
                        <span>&bull;</span>
                        <span>by {s.submitted_by}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <select
                    value={s.status}
                    onChange={(e) => onUpdateSubmission(s.id, e.target.value as SubmissionStatus)}
                    className="input-base text-xs px-2 py-1 rounded-md cursor-pointer"
                    aria-label={`Update status for ${s.company_name}`}
                  >
                    {SUBMISSION_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
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
            </div>
          ))
        )}
      </div>

      {/* Add submission form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-[var(--bg-surface-2)] rounded-lg p-3 border border-[var(--border-subtle)] space-y-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Company
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="input-base w-full px-3 py-2 rounded-lg text-sm cursor-pointer"
              required
            >
              <option value="">Select company...</option>
              {availableCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {availableCompanies.length === 0 && !newCompanyName && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                All companies already have submissions for this candidate
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCompany(); } }}
                placeholder="New company name..."
                className="input-base flex-1 px-2 py-1 rounded text-xs"
              />
              <button
                type="button"
                onClick={handleAddCompany}
                disabled={!newCompanyName.trim() || addingCompany}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] border border-[var(--border-subtle)] hover:border-[var(--primary)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={11} />
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Submitted by
            </label>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="Recruiter name..."
              className="input-base w-full px-3 py-2 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. VP Finance role, Zurich office"
              className="input-base w-full px-3 py-2 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedCompanyId || submitting}
              className="text-sm px-4"
            >
              <Send size={14} />
              Submit
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedCompanyId('');
                setNotes('');
              }}
              className="text-sm px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setSubmittedBy(candidateOwner || '');
            setShowForm(true);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors cursor-pointer px-1 py-1"
        >
          <Building2 size={12} />
          Submit to Company
        </button>
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
