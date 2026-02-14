'use client';

import { useState } from 'react';
import {
  X,
  Copy,
  FileText,
  Briefcase,
  Calendar,
  DollarSign,
  Globe,
  Users,
  Download,
  CalendarPlus,
  Send,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { NotesSection } from '@/components/NotesSection';
import { toast } from '@/components/ui/Toast';
import {
  formatTalentId,
  formatSalary,
  formatYearsExperience,
  formatCantons,
  formatEntryDate,
} from '@/lib/helpers';
import type { RecruiterCandidateView, RecruiterStatus } from '@/types/recruiter';

const ALL_STATUSES: RecruiterStatus[] = [
  'new',
  'screening',
  'interviewing',
  'offer',
  'placed',
  'rejected',
];

interface CandidateDetailPanelProps {
  candidate: RecruiterCandidateView;
  onClose: () => void;
  onUpdateStatus: (profileId: string, status: RecruiterStatus) => Promise<void>;
  onUpdateOwner: (profileId: string, owner: string) => Promise<void>;
  onAddNote: (profileId: string, text: string) => Promise<void>;
  onDeleteNote: (profileId: string, noteId: string) => Promise<void>;
  onDownloadCv: (profileId: string) => void;
}

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast('success', `${label} copied`);
}

export function CandidateDetailPanel({
  candidate: c,
  onClose,
  onUpdateStatus,
  onUpdateOwner,
  onAddNote,
  onDeleteNote,
  onDownloadCv,
}: CandidateDetailPanelProps) {
  const [ownerInput, setOwnerInput] = useState(c.owner || '');

  const handleOwnerBlur = () => {
    if (ownerInput !== (c.owner || '')) {
      onUpdateOwner(c.profile_id, ownerInput);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--bg-root)]/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg flex flex-col bg-[var(--bg-surface-1)] border-l border-[var(--border-subtle)] animate-in slide-in-from-right shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-[var(--bg-surface-0)] border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {c.contact_first_name} {c.contact_last_name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-medium bg-[var(--bg-surface-2)] px-2 py-0.5 rounded text-[var(--text-accent)]">
                {formatTalentId(c.talent_id)}
              </span>
              <span className="text-[var(--text-muted)]">&bull;</span>
              <span className="text-sm text-[var(--text-tertiary)]">
                {c.desired_roles || 'No role specified'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-2 hover:bg-[var(--bg-surface-3)] rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status section */}
          <div className="border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Status</span>
            <div className="flex items-center justify-between mt-2">
              <StatusBadge status={c.status} />
              <span className="text-xs text-[var(--text-muted)]">
                Last updated {formatEntryDate(c.profile_created_at, true)}
              </span>
            </div>

            <div className="border-t border-[var(--border-subtle)] mt-4 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer">
                  <CalendarPlus size={14} />
                  Schedule Interview
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer">
                  <Send size={14} />
                  Send Email
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <select
                value={c.status}
                onChange={(e) => onUpdateStatus(c.profile_id, e.target.value as RecruiterStatus)}
                className="input-base w-full px-3 py-2 rounded-lg text-sm cursor-pointer"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                  Owner
                </label>
                <input
                  type="text"
                  value={ownerInput}
                  onChange={(e) => setOwnerInput(e.target.value)}
                  onBlur={handleOwnerBlur}
                  placeholder="Assign owner..."
                  className="input-base w-full px-3 py-2 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[var(--text-muted)]" />
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Contact</h4>
            </div>
            <div className="bg-[var(--bg-surface-2)] rounded-lg p-4 border border-[var(--border-subtle)] space-y-3">
              <button
                onClick={() => copy(c.email, 'Email')}
                className="flex items-center justify-between text-sm w-full cursor-pointer group"
              >
                <span className="text-[var(--text-muted)]">Email</span>
                <span className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors">
                  {c.email}
                  <Copy size={12} className="opacity-0 group-hover:opacity-100" />
                </span>
              </button>

              {c.phoneNumber && (
                <button
                  onClick={() => copy(`${c.country_code}${c.phoneNumber}`, 'Phone')}
                  className="flex items-center justify-between text-sm w-full cursor-pointer group"
                >
                  <span className="text-[var(--text-muted)]">Phone</span>
                  <span className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors">
                    {c.country_code} {c.phoneNumber}
                    <Copy size={12} className="opacity-0 group-hover:opacity-100" />
                  </span>
                </button>
              )}

              {c.linkedinUrl && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">LinkedIn</span>
                  <a
                    href={c.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors"
                  >
                    View Profile
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Location</span>
                <span className="text-[var(--text-secondary)]">
                  {formatCantons(c.desired_locations)}
                </span>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Professional</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--bg-surface-2)] rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase size={12} className="text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Experience</span>
                </div>
                <p className="text-sm text-[var(--text-primary)]">
                  {formatYearsExperience(c.years_of_experience)}
                </p>
              </div>
              <div className="bg-[var(--bg-surface-2)] rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign size={12} className="text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Salary</span>
                </div>
                <p className="text-sm text-[var(--text-primary)]">
                  {formatSalary(c.salary_min, c.salary_max)}
                </p>
              </div>
              <div className="bg-[var(--bg-surface-2)] rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar size={12} className="text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Notice</span>
                </div>
                <p className="text-sm text-[var(--text-primary)]">
                  {c.notice_period_months ? `${c.notice_period_months} months` : 'N/A'}
                </p>
              </div>
              <div className="bg-[var(--bg-surface-2)] rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Globe size={12} className="text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Work Eligibility</span>
                </div>
                <p className="text-sm text-[var(--text-primary)]">
                  {c.work_eligibility || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          {c.short_summary && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Summary</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-2)] rounded-lg p-3">
                {c.short_summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {c.functional_expertise && c.functional_expertise.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Expertise</h4>
              <div className="flex flex-wrap gap-1.5">
                {c.functional_expertise.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] rounded-md border border-[var(--border-subtle)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {c.languages && c.languages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Languages</h4>
              <div className="flex flex-wrap gap-1.5">
                {c.languages.map((lang, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-[var(--primary-dim)] text-[var(--secondary)] rounded-md"
                  >
                    {typeof lang === 'string' ? lang : String(lang)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {c.cv_storage_path && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Documents</h4>
              <div className="flex items-center gap-3 bg-[var(--bg-surface-2)] rounded-lg p-3 border border-[var(--border-subtle)]">
                <div className="bg-[var(--error-dim)] text-[var(--error)] rounded w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {c.cv_original_filename || 'Curriculum Vitae'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">PDF Document</p>
                </div>
                <button
                  onClick={() => onDownloadCv(c.profile_id)}
                  className="text-[var(--text-muted)] hover:text-[var(--secondary)] transition-colors cursor-pointer p-1"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Added date */}
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <Calendar size={12} />
            Added {formatEntryDate(c.profile_created_at)}
          </div>

          {/* Notes */}
          <NotesSection
            notes={c.notes}
            onAdd={(text) => onAddNote(c.profile_id, text)}
            onDelete={(noteId) => onDeleteNote(c.profile_id, noteId)}
          />
        </div>
      </div>
    </div>
  );
}
