'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { CandidatePipeline } from '@/components/CandidatePipeline';
import { CandidateProfileDetails } from '@/components/CandidateProfileDetails';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatTalentId, formatEntryDate } from '@/lib/helpers';
import { STATUS_PILL_COLORS } from '@/lib/constants';
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

const PILL_BG = Object.fromEntries(Object.entries(STATUS_PILL_COLORS).map(([k, v]) => [k, v.bg]));
const PILL_TEXT = Object.fromEntries(Object.entries(STATUS_PILL_COLORS).map(([k, v]) => [k, v.text]));

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
  onToggleFavorite?: (profileId: string) => void;
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
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileEditData>(() => buildFormData(c));
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileEditData, string>>>({});
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const closeAfterDiscard = useRef(false);

  useEffect(() => {
    setIsEditing(false);
    setSaving(false);
    setFormData(buildFormData(c));
    setErrors({});
    setOwnerInput(c.owner || '');
  }, [c.profile_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasUnsavedChanges = useCallback(() => {
    if (!isEditing) return false;
    return JSON.stringify(formData) !== JSON.stringify(buildFormData(c));
  }, [isEditing, formData, c]);

  const handleClosePanel = useCallback(() => {
    if (hasUnsavedChanges()) {
      closeAfterDiscard.current = true;
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

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
    if (ownerInput !== (c.owner || '')) onUpdateOwner(c.profile_id, ownerInput);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await onDelete(c.profile_id); } catch { setDeleting(false); }
  };

  const updateField = <K extends keyof ProfileEditData>(key: K, value: ProfileEditData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateForm = (): boolean => {
    const e: Partial<Record<keyof ProfileEditData, string>> = {};
    if (!formData.contact_first_name.trim()) e.contact_first_name = 'Required';
    if (!formData.contact_last_name.trim()) e.contact_last_name = 'Required';
    if (!formData.email.trim()) e.email = 'Required';
    else if (!EMAIL_RE.test(formData.email)) e.email = 'Invalid email';
    if (formData.years_of_experience && (isNaN(Number(formData.years_of_experience)) || Number(formData.years_of_experience) < 0)) e.years_of_experience = 'Invalid';
    if (formData.salary_min && formData.salary_max) {
      const min = Number(formData.salary_min), max = Number(formData.salary_max);
      if (!isNaN(min) && !isNaN(max) && max < min) e.salary_max = 'Must be >= min';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try { await onUpdateProfile(c.profile_id, formData); setIsEditing(false); setErrors({}); }
    catch { /* stay */ }
    finally { setSaving(false); }
  };

  // Derived data
  const activeSubs = submissions.filter(s => s.status === 'submitted' || s.status === 'interviewing');
  const tagline = activeSubs.length > 0
    ? `${c.desired_roles || 'Professional'} — ${activeSubs.map(s => `${s.company_name} ${s.status}`).join(', ')}`
    : `${c.desired_roles || 'Professional'} — No active submissions`;

  const recentNote = [...(c.notes || [])].find(n => {
    if (!('type' in n) || n.type === 'note') {
      return Math.floor((Date.now() - new Date(n.created_at).getTime()) / 86400000) <= 14;
    }
    return false;
  });
  const noteSnippet = recentNote && 'text' in recentNote
    ? (recentNote.text.length > 120 ? recentNote.text.slice(0, 120) + '...' : recentNote.text)
    : null;

  /* ========== RENDER ========== */
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[var(--bg-root)]/70" onClick={() => { if (!saving) handleClosePanel(); }} />

      {/* Dossier card — matches mockup .dossier exactly */}
      <div
        className="relative w-full max-w-[720px] flex flex-col animate-in slide-in-from-right m-3 overflow-hidden"
        style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-strong)', borderRadius: '8px' }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-strong)' }} className="flex items-start justify-between gap-4">
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {c.contact_first_name} {c.contact_last_name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'monospace', marginTop: '2px' }}>
              {formatTalentId(c.talent_id)} &bull; Added {formatEntryDate(c.profile_created_at)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {tagline}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isEditing ? (
              <>
                <button onClick={() => { setFormData(buildFormData(c)); setErrors({}); setIsEditing(false); }} disabled={saving}
                  style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', background: 'var(--primary)', border: '1px solid var(--primary-hover)', color: 'var(--text-primary)', cursor: 'pointer' }}
                  className="flex items-center gap-1.5">
                  {saving && <Loader2 size={12} className="animate-spin" />} Save
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onDownloadCv(c.profile_id)}
                  style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Download CV
                </button>
                <button onClick={() => setIsEditing(true)}
                  style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 500, borderRadius: '6px', border: '1px solid var(--border-strong)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Edit
                </button>
              </>
            )}
            <button onClick={handleClosePanel} className="ml-1 cursor-pointer p-1.5 rounded-full hover:bg-[var(--bg-surface-3)]">
              <X size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </div>
        </div>

        {/* ── Body: grid 280px | 1fr ── */}
        <div className="flex-1 overflow-y-auto modal-scroll" style={{ display: 'grid', gridTemplateColumns: isEditing ? '1fr' : '280px 1fr' }}>

          {/* ── Sidebar ── */}
          {!isEditing && (
            <div style={{ borderRight: '1px solid var(--border-strong)', padding: '16px 20px' }}>
              {/* Status */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Status</div>
                <select value={c.status} onChange={(e) => onUpdateStatus(c.profile_id, e.target.value as RecruiterStatus)}
                  style={{ fontSize: '10px', fontWeight: 600, padding: '2px 18px 2px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer', WebkitAppearance: 'none', appearance: 'none', background: PILL_BG[c.status], color: PILL_TEXT[c.status], backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(PILL_TEXT[c.status])}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center' }}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              {/* Owner */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Owner</div>
                <input type="text" value={ownerInput} onChange={(e) => setOwnerInput(e.target.value)} onBlur={handleOwnerBlur} placeholder="Unassigned"
                  style={{ fontSize: '12px', color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', padding: 0, width: '100%' }} />
              </div>
              {/* Contact */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Contact</div>
                <div style={{ fontSize: '12px', color: 'var(--text-accent)' }}>{c.email}</div>
                {c.phoneNumber && <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>{c.country_code} {c.phoneNumber}</div>}
                {c.linkedinUrl && <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--text-accent)', marginTop: '2px', display: 'block' }}>LinkedIn ↗</a>}
              </div>
              {/* Location */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Location</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{c.desired_locations?.join(', ') || '—'}</div>
              </div>
              {/* Experience */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Experience</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{c.years_of_experience ? `${c.years_of_experience} years` : '—'}</div>
              </div>
              {/* Salary */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Target Salary</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                  {c.salary_min || c.salary_max
                    ? `CHF ${c.salary_min ? `${Math.round(c.salary_min / 1000)}k` : '?'} – ${c.salary_max ? `${Math.round(c.salary_max / 1000)}k` : '?'}`
                    : '—'}
                </div>
              </div>
              {/* Desired Roles */}
              {c.desired_roles && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Desired Roles</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                    {c.desired_roles.split(',').map((r, i) => (
                      <span key={i} style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '4px', background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }}>{r.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Languages */}
              {c.languages && c.languages.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Languages</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                    {c.languages.map((l, i) => (
                      <span key={i} style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '4px', background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }}>
                        {l.language}{l.proficiency ? ` (${l.proficiency})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Functional Expertise */}
              {c.functional_expertise && c.functional_expertise.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Expertise</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                    {c.functional_expertise.map((skill, i) => (
                      <span key={i} style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '4px', background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Work Eligibility */}
              {c.work_eligibility && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Work Eligibility</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{c.work_eligibility.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                </div>
              )}
              {/* Notice Period */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Notice Period</div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{c.notice_period_months ? `${c.notice_period_months} months` : '—'}</div>
              </div>
              {/* Summary */}
              {c.short_summary && (
                <div>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>Summary</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.short_summary}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Main ── */}
          <div style={{ padding: '16px 20px' }}>
            {isEditing ? (
              /* Edit mode — full form */
              <div>
                <CandidateProfileDetails
                  candidate={c}
                  isEditing={true}
                  formData={formData}
                  errors={errors}
                  onUpdateField={updateField}
                />
                <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid var(--border-strong)' }}>
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 cursor-pointer"
                    style={{ fontSize: '13px', color: 'var(--error)', padding: '6px 12px', borderRadius: '8px', background: 'transparent', border: 'none' }}>
                    <Trash2 size={14} /> Delete Profile
                  </button>
                </div>
              </div>
            ) : (
              /* View mode — single unified view, no tabs */
              <div>
                {/* Executive Summary */}
                <div style={{ background: 'var(--bg-nested)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px', fontSize: '12px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Executive Summary</strong>
                  {' — '}
                  {c.contact_first_name} {c.contact_last_name} is a {c.years_of_experience || 0}-year {c.desired_roles || 'professional'} based in {c.desired_locations?.[0] || 'unspecified location'}.
                  {' '}{activeSubs.length > 0
                    ? `Currently ${activeSubs.map(s => `${s.status} at ${s.company_name}`).join(', ')}.`
                    : 'No active submissions.'}
                  {noteSnippet && <> <em style={{ color: 'var(--text-tertiary)' }}>&ldquo;{noteSnippet}&rdquo;</em></>}
                </div>

                {/* Submissions + Submit form + Notes + Timeline — all in one */}
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
              </div>
            )}
          </div>
        </div>

        {/* Dialogs */}
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
