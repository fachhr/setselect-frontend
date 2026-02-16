'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronDown,
  Trash2,
  Pencil,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { WORK_ELIGIBILITY_LABELS, WORK_ELIGIBILITY_OPTIONS } from '@/lib/constants';
import { NotesSection } from '@/components/NotesSection';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import {
  formatTalentId,
  formatSalary,
  formatYearsExperience,
  formatCantons,
  formatEntryDate,
} from '@/lib/helpers';
import type { RecruiterCandidateView, RecruiterStatus, ProfileEditData } from '@/types/recruiter';

const ALL_STATUSES: RecruiterStatus[] = [
  'new',
  'screening',
  'interviewing',
  'offer',
  'placed',
  'rejected',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CandidateDetailPanelProps {
  candidate: RecruiterCandidateView;
  onClose: () => void;
  onUpdateStatus: (profileId: string, status: RecruiterStatus) => Promise<void>;
  onUpdateOwner: (profileId: string, owner: string) => Promise<void>;
  onAddNote: (profileId: string, text: string) => Promise<void>;
  onDeleteNote: (profileId: string, noteId: string) => Promise<void>;
  onDownloadCv: (profileId: string) => void;
  onDelete: (profileId: string) => Promise<void>;
  onUpdateProfile: (profileId: string, data: ProfileEditData) => Promise<void>;
}

function copy(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast('success', `${label} copied`);
}

function buildFormData(c: RecruiterCandidateView): ProfileEditData {
  return {
    contact_first_name: c.contact_first_name,
    contact_last_name: c.contact_last_name,
    email: c.email,
    country_code: c.country_code,
    phoneNumber: c.phoneNumber,
    linkedinUrl: c.linkedinUrl || '',
    years_of_experience: c.years_of_experience ? String(c.years_of_experience) : '',
    desired_roles: c.desired_roles || '',
    desired_locations: c.desired_locations || [],
    salary_min: c.salary_min ? String(c.salary_min) : '',
    salary_max: c.salary_max ? String(c.salary_max) : '',
    notice_period_months: c.notice_period_months || '',
    work_eligibility: c.work_eligibility || '',
    short_summary: c.short_summary || '',
    functional_expertise: c.functional_expertise || [],
    languages: c.languages || [],
  };
}

export function CandidateDetailPanel({
  candidate: c,
  onClose,
  onUpdateStatus,
  onUpdateOwner,
  onAddNote,
  onDeleteNote,
  onDownloadCv,
  onDelete,
  onUpdateProfile,
}: CandidateDetailPanelProps) {
  const [ownerInput, setOwnerInput] = useState(c.owner || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileEditData>(() => buildFormData(c));
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileEditData, string>>>({});
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Reset edit mode when candidate changes
  useEffect(() => {
    setIsEditing(false);
    setSaving(false);
    setFormData(buildFormData(c));
    setErrors({});
    setOwnerInput(c.owner || '');
  }, [c.profile_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasUnsavedChanges = useCallback(() => {
    if (!isEditing) return false;
    const original = buildFormData(c);
    return JSON.stringify(formData) !== JSON.stringify(original);
  }, [isEditing, formData, c]);

  const closeAfterDiscard = useRef(false);

  const handleEscape = useCallback(() => {
    if (hasUnsavedChanges()) {
      closeAfterDiscard.current = false;
      setShowDiscardConfirm(true);
    } else if (isEditing) {
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, isEditing, onClose]);

  const handleClosePanel = useCallback(() => {
    if (hasUnsavedChanges()) {
      closeAfterDiscard.current = true;
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDiscardConfirm || showDeleteConfirm) return;
        e.preventDefault();
        handleEscape();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleEscape, showDiscardConfirm, showDeleteConfirm]);

  const handleOwnerBlur = () => {
    if (ownerInput !== (c.owner || '')) {
      onUpdateOwner(c.profile_id, ownerInput);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(c.profile_id);
    } catch {
      setDeleting(false);
    }
  };

  const handleBackdropClick = () => {
    if (saving) return;
    handleClosePanel();
  };

  const updateField = <K extends keyof ProfileEditData>(key: K, value: ProfileEditData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileEditData, string>> = {};

    if (!formData.contact_first_name.trim()) newErrors.contact_first_name = 'Required';
    if (!formData.contact_last_name.trim()) newErrors.contact_last_name = 'Required';
    if (!formData.email.trim()) {
      newErrors.email = 'Required';
    } else if (!EMAIL_RE.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (formData.years_of_experience && (isNaN(Number(formData.years_of_experience)) || Number(formData.years_of_experience) < 0)) {
      newErrors.years_of_experience = 'Must be a valid number';
    }
    if (formData.salary_min && (isNaN(Number(formData.salary_min)) || Number(formData.salary_min) < 0)) {
      newErrors.salary_min = 'Must be a valid number';
    }
    if (formData.salary_max && (isNaN(Number(formData.salary_max)) || Number(formData.salary_max) < 0)) {
      newErrors.salary_max = 'Must be a valid number';
    }
    if (formData.salary_min && formData.salary_max) {
      const min = Number(formData.salary_min);
      const max = Number(formData.salary_max);
      if (!isNaN(min) && !isNaN(max) && max < min) {
        newErrors.salary_max = 'Must be >= min';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await onUpdateProfile(c.profile_id, formData);
      setIsEditing(false);
      setErrors({});
    } catch {
      // stay in edit mode
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(buildFormData(c));
    setErrors({});
    setIsEditing(false);
  };

  const inputClass = 'input-base w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm';
  const labelClass = 'text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-1';
  const errorClass = 'text-xs text-[var(--error)] mt-0.5';

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--bg-root)]/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg flex flex-col bg-[var(--bg-surface-1)] border-l border-[var(--border-subtle)] animate-in slide-in-from-right shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[var(--bg-surface-1)] border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {c.contact_first_name} {c.contact_last_name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[10px] sm:text-xs font-medium bg-[var(--bg-surface-2)] px-2 py-0.5 rounded text-[var(--text-muted)] sm:text-[var(--text-accent)]">
                {formatTalentId(c.talent_id)}
              </span>
              <span className="text-[var(--text-muted)]">&bull;</span>
              <span className="text-sm text-[var(--text-tertiary)]">
                {c.desired_roles || 'No role specified'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="text-sm px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-2 hover:bg-[var(--bg-surface-3)] rounded-full"
                title="Edit profile"
              >
                <Pencil size={16} />
              </button>
            )}
            <button
              onClick={handleClosePanel}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-2 hover:bg-[var(--bg-surface-3)] rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto modal-scroll p-4 sm:p-6 space-y-4 sm:space-y-8">
          {/* Status section — always editable, no change */}
          <div className="border border-[var(--border-subtle)] rounded-xl p-3 sm:p-4 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Status</span>
            <div className="flex items-center justify-between mt-2">
              <StatusBadge status={c.status} />
              <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
                Last updated {formatEntryDate(c.profile_created_at, true)}
              </span>
            </div>

            <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              <select
                value={c.status}
                onChange={(e) => onUpdateStatus(c.profile_id, e.target.value as RecruiterStatus)}
                className="input-base w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm cursor-pointer"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>

              <div>
                <label className={labelClass}>Owner</label>
                <input
                  type="text"
                  value={ownerInput}
                  onChange={(e) => setOwnerInput(e.target.value)}
                  onBlur={handleOwnerBlur}
                  placeholder="Assign owner..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[var(--text-muted)]" />
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Contact</h4>
            </div>

            {isEditing ? (
              <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      type="text"
                      value={formData.contact_first_name}
                      onChange={(e) => updateField('contact_first_name', e.target.value)}
                      className={inputClass}
                    />
                    {errors.contact_first_name && <p className={errorClass}>{errors.contact_first_name}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input
                      type="text"
                      value={formData.contact_last_name}
                      onChange={(e) => updateField('contact_last_name', e.target.value)}
                      className={inputClass}
                    />
                    {errors.contact_last_name && <p className={errorClass}>{errors.contact_last_name}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={inputClass}
                  />
                  {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>
                <div className="flex gap-3">
                  <div className="w-24">
                    <label className={labelClass}>Code</label>
                    <input
                      type="text"
                      value={formData.country_code}
                      onChange={(e) => updateField('country_code', e.target.value)}
                      placeholder="+41"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Phone</label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => updateField('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-2 sm:space-y-3">
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
                    {formatCantons(c.desired_locations, Infinity)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Professional Info */}
          <div className="space-y-1.5 sm:space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Professional</h4>

            {isEditing ? (
              <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Experience (years)</label>
                    <input
                      type="text"
                      value={formData.years_of_experience}
                      onChange={(e) => updateField('years_of_experience', e.target.value)}
                      placeholder="e.g. 5"
                      className={inputClass}
                    />
                    {errors.years_of_experience && <p className={errorClass}>{errors.years_of_experience}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Notice (months)</label>
                    <input
                      type="text"
                      value={formData.notice_period_months}
                      onChange={(e) => updateField('notice_period_months', e.target.value)}
                      placeholder="e.g. 3"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Salary Min (CHF)</label>
                    <input
                      type="text"
                      value={formData.salary_min}
                      onChange={(e) => updateField('salary_min', e.target.value)}
                      placeholder="e.g. 100000"
                      className={inputClass}
                    />
                    {errors.salary_min && <p className={errorClass}>{errors.salary_min}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Salary Max (CHF)</label>
                    <input
                      type="text"
                      value={formData.salary_max}
                      onChange={(e) => updateField('salary_max', e.target.value)}
                      placeholder="e.g. 150000"
                      className={inputClass}
                    />
                    {errors.salary_max && <p className={errorClass}>{errors.salary_max}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Desired Role</label>
                  <input
                    type="text"
                    value={formData.desired_roles}
                    onChange={(e) => updateField('desired_roles', e.target.value)}
                    placeholder="e.g. Product Manager"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Locations (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.desired_locations.join(', ')}
                    onChange={(e) => updateField('desired_locations', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="e.g. Zurich, Bern, Basel"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Work Eligibility</label>
                  <select
                    value={formData.work_eligibility}
                    onChange={(e) => updateField('work_eligibility', e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">Select...</option>
                    {WORK_ELIGIBILITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-[var(--bg-surface-2)] rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                    <Briefcase size={12} className="text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Experience</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">
                    {formatYearsExperience(c.years_of_experience)}
                  </p>
                </div>
                <div className="bg-[var(--bg-surface-2)] rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                    <DollarSign size={12} className="text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Salary</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">
                    {formatSalary(c.salary_min, c.salary_max)}
                  </p>
                </div>
                <div className="bg-[var(--bg-surface-2)] rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                    <Calendar size={12} className="text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Notice</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">
                    {c.notice_period_months ? `${c.notice_period_months} months` : 'N/A'}
                  </p>
                </div>
                <div className="bg-[var(--bg-surface-2)] rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                    <Globe size={12} className="text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">Work Eligibility</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">
                    {(c.work_eligibility && WORK_ELIGIBILITY_LABELS[c.work_eligibility]) || c.work_eligibility || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {isEditing ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Summary</h4>
              <textarea
                value={formData.short_summary}
                onChange={(e) => updateField('short_summary', e.target.value)}
                rows={4}
                placeholder="Brief candidate summary..."
                className={`${inputClass} resize-y`}
              />
            </div>
          ) : (
            c.short_summary && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Summary</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-snug sm:leading-relaxed bg-[var(--bg-surface-2)] rounded-lg p-2.5 sm:p-3">
                  {c.short_summary}
                </p>
              </div>
            )
          )}

          {/* Skills / Expertise */}
          {isEditing ? (
            <div className="space-y-1.5 sm:space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Expertise</h4>
              <input
                type="text"
                value={formData.functional_expertise.join(', ')}
                onChange={(e) => updateField('functional_expertise', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                placeholder="e.g. Finance, Strategy, Operations"
                className={inputClass}
              />
            </div>
          ) : (
            c.functional_expertise && c.functional_expertise.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Expertise</h4>
                <div className="flex flex-wrap gap-1.5">
                  {c.functional_expertise.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] rounded-md border border-[var(--border-subtle)] hover:border-[var(--secondary)] hover:text-[var(--text-primary)] transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Languages */}
          {isEditing ? (
            <div className="space-y-1.5 sm:space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Languages</h4>
              <input
                type="text"
                value={formData.languages.join(', ')}
                onChange={(e) => updateField('languages', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                placeholder="e.g. English, German, French"
                className={inputClass}
              />
            </div>
          ) : (
            c.languages && c.languages.length > 0 && (
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Languages</h4>
                <div className="flex flex-wrap gap-1.5">
                  {c.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs bg-[var(--primary-dim)] text-[var(--secondary)] rounded-md border border-transparent hover:border-[var(--secondary)] transition-colors cursor-default"
                    >
                      {typeof lang === 'string' ? lang : String(lang)}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Documents */}
          {c.cv_storage_path && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Documents</h4>
              <div className="flex items-center gap-2 sm:gap-3 bg-[var(--bg-surface-2)] rounded-lg p-2.5 sm:p-3 border border-[var(--border-subtle)]">
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

          {/* Notes — collapsible on mobile */}
          <div className="sm:hidden">
            <details>
              <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] list-none [&::-webkit-details-marker]:hidden">
                Notes ({c.notes.length})
                <ChevronDown size={14} className="transition-transform [[open]>&]:rotate-180" />
              </summary>
              <div className="mt-2">
                <NotesSection
                  notes={c.notes}
                  onAdd={(text) => onAddNote(c.profile_id, text)}
                  onDelete={(noteId) => onDeleteNote(c.profile_id, noteId)}
                />
              </div>
            </details>
          </div>
          <div className="hidden sm:block">
            <NotesSection
              notes={c.notes}
              onAdd={(text) => onAddNote(c.profile_id, text)}
              onDelete={(noteId) => onDeleteNote(c.profile_id, noteId)}
            />
          </div>

          {/* Delete */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error-dim)] px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              Delete Profile
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete Profile"
          message={`Permanently delete ${c.contact_first_name} ${c.contact_last_name}'s profile? This will remove all data and cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleting}
        />

        <ConfirmDialog
          open={showDiscardConfirm}
          title="Discard Changes"
          message="You have unsaved changes. Discard them?"
          confirmLabel="Discard"
          onConfirm={() => {
            setShowDiscardConfirm(false);
            setIsEditing(false);
            setFormData(buildFormData(c));
            setErrors({});
            if (closeAfterDiscard.current) onClose();
          }}
          onCancel={() => setShowDiscardConfirm(false)}
        />
      </div>
    </div>
  );
}
