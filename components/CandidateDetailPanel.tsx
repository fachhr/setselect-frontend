'use client';

import { useState } from 'react';
import {
  X,
  Copy,
  FileText,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  DollarSign,
  Linkedin,
  Globe,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { NotesSection } from '@/components/NotesSection';
import { Button } from '@/components/ui/Button';
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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[var(--bg-surface-1)] border-l border-[var(--border-subtle)] z-50 overflow-y-auto animate-in slide-in-from-right shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-surface-1)] border-b border-[var(--border-subtle)] p-5 flex items-start justify-between z-10">
          <div>
            <p className="text-xs text-[var(--text-accent)] font-mono">
              {formatTalentId(c.talent_id)}
            </p>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-0.5">
              {c.contact_first_name} {c.contact_last_name}
            </h3>
            <p className="text-sm text-[var(--text-tertiary)]">
              {c.desired_roles || 'No role specified'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status + Owner */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Status</span>
              <StatusBadge status={c.status} />
            </div>
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

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Contact</h4>
            <div className="space-y-2">
              <button
                onClick={() => copy(c.email, 'Email')}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors cursor-pointer group w-full"
              >
                <Mail size={14} className="text-[var(--text-muted)]" />
                <span className="flex-1 text-left">{c.email}</span>
                <Copy size={12} className="opacity-0 group-hover:opacity-100" />
              </button>

              {c.phoneNumber && (
                <button
                  onClick={() => copy(`${c.country_code}${c.phoneNumber}`, 'Phone')}
                  className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors cursor-pointer group w-full"
                >
                  <Phone size={14} className="text-[var(--text-muted)]" />
                  <span className="flex-1 text-left">
                    {c.country_code} {c.phoneNumber}
                  </span>
                  <Copy size={12} className="opacity-0 group-hover:opacity-100" />
                </button>
              )}

              {c.linkedinUrl && (
                <a
                  href={c.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--secondary)] transition-colors"
                >
                  <Linkedin size={14} className="text-[var(--text-muted)]" />
                  LinkedIn Profile
                </a>
              )}

              <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                <MapPin size={14} className="text-[var(--text-muted)]" />
                {formatCantons(c.desired_locations)}
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="space-y-2">
            <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Professional</h4>
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
              <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Summary</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-2)] rounded-lg p-3">
                {c.short_summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {c.functional_expertise && c.functional_expertise.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Expertise</h4>
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
              <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Languages</h4>
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
              <h4 className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Documents</h4>
              <Button
                variant="secondary"
                onClick={() => onDownloadCv(c.profile_id)}
                className="flex items-center gap-2 w-full justify-center"
              >
                <FileText size={14} />
                Download CV
                {c.cv_original_filename && (
                  <span className="text-[var(--text-muted)] text-xs">
                    ({c.cv_original_filename})
                  </span>
                )}
              </Button>
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
    </>
  );
}
