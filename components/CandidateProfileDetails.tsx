'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { WORK_ELIGIBILITY_OPTIONS } from '@/lib/constants';
import type { RecruiterCandidateView, ProfileEditData, LanguageEntry } from '@/types/recruiter';

interface CandidateProfileDetailsProps {
  candidate: RecruiterCandidateView;
  isEditing: boolean;
  formData: ProfileEditData;
  errors: Partial<Record<keyof ProfileEditData, string>>;
  onUpdateField: <K extends keyof ProfileEditData>(key: K, value: ProfileEditData[K]) => void;
}

const inputClass = 'input-base w-full px-3 py-1.5 sm:py-2 rounded-lg text-sm';
const labelClass = 'text-xs text-[var(--text-muted)] uppercase tracking-wider block mb-1';
const errorClass = 'text-xs text-[var(--error)] mt-0.5';

export function CandidateProfileDetails({
  candidate,
  isEditing,
  formData,
  errors,
  onUpdateField,
}: CandidateProfileDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Contact */}
        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Contact</h4>
        <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name *</label>
              <input className={inputClass} value={formData.contact_first_name} onChange={(e) => onUpdateField('contact_first_name', e.target.value)} />
              {errors.contact_first_name && <p className={errorClass}>{errors.contact_first_name}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input className={inputClass} value={formData.contact_last_name} onChange={(e) => onUpdateField('contact_last_name', e.target.value)} />
              {errors.contact_last_name && <p className={errorClass}>{errors.contact_last_name}</p>}
            </div>
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" className={inputClass} value={formData.email} onChange={(e) => onUpdateField('email', e.target.value)} />
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>
          <div className="flex gap-3">
            <div className="w-24">
              <label className={labelClass}>Code</label>
              <input className={inputClass} value={formData.country_code} onChange={(e) => onUpdateField('country_code', e.target.value)} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={formData.phoneNumber} onChange={(e) => onUpdateField('phoneNumber', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input className={inputClass} value={formData.linkedinUrl} onChange={(e) => onUpdateField('linkedinUrl', e.target.value)} />
          </div>
        </div>

        {/* Professional */}
        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Professional</h4>
        <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Experience (years)</label>
              <input type="number" className={inputClass} value={formData.years_of_experience} onChange={(e) => onUpdateField('years_of_experience', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Notice (months)</label>
              <input type="number" className={inputClass} value={formData.notice_period_months} onChange={(e) => onUpdateField('notice_period_months', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Salary Min</label>
              <input type="number" className={inputClass} value={formData.salary_min} onChange={(e) => onUpdateField('salary_min', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Salary Max</label>
              <input type="number" className={inputClass} value={formData.salary_max} onChange={(e) => onUpdateField('salary_max', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Desired Role</label>
            <input className={inputClass} value={formData.desired_roles} onChange={(e) => onUpdateField('desired_roles', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Locations (comma-separated)</label>
            <input
              className={inputClass}
              value={formData.desired_locations.join(', ')}
              onChange={(e) => onUpdateField('desired_locations', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            />
          </div>
          <div>
            <label className={labelClass}>Work Eligibility</label>
            <select className={inputClass} value={formData.work_eligibility} onChange={(e) => onUpdateField('work_eligibility', e.target.value)}>
              <option value="">Select…</option>
              {WORK_ELIGIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary */}
        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Summary</h4>
        <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-3">
          <div>
            <label className={labelClass}>Short Summary</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              value={formData.short_summary}
              onChange={(e) => onUpdateField('short_summary', e.target.value)}
            />
          </div>
        </div>

        {/* Expertise */}
        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Expertise</h4>
        <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-3">
          <div>
            <label className={labelClass}>Functional Expertise (comma-separated)</label>
            <input
              className={inputClass}
              value={formData.functional_expertise.join(', ')}
              onChange={(e) => onUpdateField('functional_expertise', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            />
          </div>
        </div>

        {/* Languages */}
        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Languages</h4>
        <div className="bg-[var(--bg-surface-2)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-3">
          <div>
            <label className={labelClass}>Languages — e.g. English (Native), German (B2)</label>
            <input
              className={inputClass}
              value={formData.languages
                .map((l) => (l.proficiency ? `${l.language} (${l.proficiency})` : l.language))
                .join(', ')}
              onChange={(e) => {
                const entries: LanguageEntry[] = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((s) => {
                    const match = s.match(/^(.+?)\s*\((.+?)\)\s*$/);
                    return match ? { language: match[1].trim(), proficiency: match[2].trim() } : { language: s };
                  });
                onUpdateField('languages', entries);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // View mode — collapsible
  const hasSummary = !!candidate.short_summary;
  const hasExpertise = candidate.functional_expertise && candidate.functional_expertise.length > 0;
  const hasLanguages = candidate.languages && candidate.languages.length > 0;
  const hasContent = hasSummary || hasExpertise || hasLanguages;

  if (!hasContent) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left cursor-pointer py-2"
      >
        <ChevronRight
          size={14}
          className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
        <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
          Profile Details
        </h4>
      </button>
      {isOpen && (
        <div className="space-y-4 mt-2">
          {hasSummary && (
            <div className="space-y-1.5">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Summary</span>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-surface-2)] rounded-lg p-2.5">
                {candidate.short_summary}
              </p>
            </div>
          )}

          {hasExpertise && (
            <div className="space-y-1.5">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Expertise</span>
              <div className="flex flex-wrap gap-1.5">
                {candidate.functional_expertise!.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs bg-[var(--bg-surface-2)] text-[var(--text-tertiary)] rounded-md border border-[var(--border-subtle)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasLanguages && (
            <div className="space-y-1.5">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Languages</span>
              <div className="flex flex-wrap gap-1.5">
                {candidate.languages!.map((lang, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs bg-[var(--primary-dim)] text-[var(--secondary)] rounded-md"
                  >
                    {lang.language}
                    {lang.proficiency && lang.proficiency !== 'undefined' && lang.proficiency !== 'null'
                      ? ` · ${lang.proficiency}`
                      : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
