'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Pencil, Loader2, Trash2, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { FavoriteButton } from '@/components/FavoriteButton';
import { CandidateKeyFacts } from '@/components/CandidateKeyFacts';
import { CandidatePipeline } from '@/components/CandidatePipeline';
import { CandidateProfileDetails } from '@/components/CandidateProfileDetails';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { formatTalentId, formatEntryDate } from '@/lib/helpers';
import type {
  RecruiterCandidateView,
  RecruiterStatus,
  ProfileEditData,
  CandidateSubmission,
  SubmissionStatus,
  SubmissionCompany,
} from '@/types/recruiter';

const ALL_STATUSES: RecruiterStatus[] = [
  'new', 'screening', 'interviewing', 'offer', 'placed', 'rejected',
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
  onToggleFavorite: (profileId: string) => void;
  submissions: CandidateSubmission[];
  companies: SubmissionCompany[];
  onCompanyAdded?: (company: SubmissionCompany) => void;
  onCreateSubmission: (companyId: string, submittedBy: string, notes: string) => Promise<void>;
  onUpdateSubmission: (submissionId: string, status: SubmissionStatus) => Promise<void>;
  onDeleteSubmission: (submissionId: string) => Promise<void>;
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
  onToggleFavorite,
  submissions,
  companies,
  onCreateSubmission,
  onUpdateSubmission,
  onDeleteSubmission,
  onCompanyAdded,
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

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--bg-root)]/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg flex flex-col bg-[var(--bg-surface-1)] border-l border-[var(--border-subtle)] animate-in slide-in-from-right shadow-2xl">
        {/* Header — name, ref, role, status, owner */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[var(--bg-surface-1)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                  {c.contact_first_name} {c.contact_last_name}
                </h3>
                <FavoriteButton
                  isFavorite={c.is_favorite}
                  onToggle={() => onToggleFavorite(c.profile_id)}
                  size={16}
                />
              </div>
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

          {/* Status & Owner — always in header */}
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={c.status} />
            <select
              value={c.status}
              onChange={(e) => onUpdateStatus(c.profile_id, e.target.value as RecruiterStatus)}
              className="input-base px-2 py-1 rounded-md text-xs cursor-pointer"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <span className="text-[var(--text-muted)] text-xs">|</span>
            <input
              type="text"
              value={ownerInput}
              onChange={(e) => setOwnerInput(e.target.value)}
              onBlur={handleOwnerBlur}
              placeholder="Owner..."
              className="input-base px-2 py-1 rounded-md text-xs flex-1 min-w-0"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto modal-scroll p-4 sm:p-6 space-y-5">
          {/* Key Facts */}
          {!isEditing && (
            <CandidateKeyFacts
              candidate={c}
              onDownloadCv={onDownloadCv}
            />
          )}

          {/* Pipeline & Activity */}
          {!isEditing && (
            <CandidatePipeline
              candidate={c}
              submissions={submissions}
              companies={companies}
              onAddNote={(text) => onAddNote(c.profile_id, text)}
              onDeleteNote={(noteId) => onDeleteNote(c.profile_id, noteId)}
              onCreateSubmission={onCreateSubmission}
              onUpdateSubmission={onUpdateSubmission}
              onDeleteSubmission={onDeleteSubmission}
              onCompanyAdded={onCompanyAdded}
            />
          )}

          {/* Profile Details (collapsible in view mode, expanded in edit mode) */}
          <CandidateProfileDetails
            candidate={c}
            isEditing={isEditing}
            formData={formData}
            errors={errors}
            onUpdateField={updateField}
          />

          {/* Added date */}
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
            <Calendar size={12} />
            Added {formatEntryDate(c.profile_created_at)}
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
