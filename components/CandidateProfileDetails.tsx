'use client';

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
const labelClass = 'text-[9px] text-[var(--text-muted)] uppercase tracking-[1.2px] font-semibold block mb-1';
const errorClass = 'text-xs text-[var(--error)] mt-0.5';
const sectionClass = 'bg-[var(--bg-nested)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)] space-y-3';

export function CandidateProfileDetails({
  isEditing,
  formData,
  errors,
  onUpdateField,
}: CandidateProfileDetailsProps) {
  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Contact */}
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--text-tertiary)]">Contact</h4>
        <div className={sectionClass}>
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
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--text-tertiary)]">Professional</h4>
        <div className={sectionClass}>
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
              <option value="">Select...</option>
              {WORK_ELIGIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary & Expertise */}
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--text-tertiary)]">Summary & Expertise</h4>
        <div className={sectionClass}>
          <div>
            <label className={labelClass}>Short Summary</label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              value={formData.short_summary}
              onChange={(e) => onUpdateField('short_summary', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Functional Expertise (comma-separated)</label>
            <input
              className={inputClass}
              value={formData.functional_expertise.join(', ')}
              onChange={(e) => onUpdateField('functional_expertise', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            />
          </div>
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

  // View mode is no longer used — all info is in the sidebar.
  // This component is only rendered with isEditing={true}.
  return null;
}
