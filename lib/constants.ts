export const WORK_ELIGIBILITY_OPTIONS = [
  { value: 'swiss_citizen', label: 'Swiss Citizen' },
  { value: 'c_permit', label: 'C Permit' },
  { value: 'eu_efta', label: 'EU/EFTA' },
  { value: 'b_permit', label: 'B Permit' },
  { value: 'g_permit', label: 'G Permit' },
  { value: 'requires_sponsorship', label: 'Requires Sponsorship' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: '0-2', label: '0–2 yrs' },
  { value: '3-5', label: '3–5 yrs' },
  { value: '6-10', label: '6–10 yrs' },
  { value: '10+', label: '10+ yrs' },
] as const;

/** Dark saturated pill backgrounds + text for each status (matches approved mockup) */
export const STATUS_PILL_COLORS: Record<string, { bg: string; text: string }> = {
  new:           { bg: '#1e3a5f', text: '#93c5fd' },
  screening:     { bg: '#2d1f5e', text: '#c4b5fd' },
  interviewing:  { bg: '#3d2f0a', text: '#fcd34d' },
  offer:         { bg: '#3d1f0a', text: '#fdba74' },
  placed:        { bg: '#064e3b', text: '#6ee7b7' },
  rejected:      { bg: '#1a1020', text: '#94a3b8' },
  submitted:     { bg: '#1e3a5f', text: '#93c5fd' },
};

// --- Job Scraping constants ---

export const TARGET_COUNTRY_OPTIONS = [
  'Switzerland',
  'Bulgaria',
  'United Kingdom',
] as const;

export const DEFAULT_TARGET_COUNTRIES = ['Switzerland'] as const;

export const JOB_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'evaluating', label: 'Evaluating' },
  { value: 'pursuing', label: 'Pursuing' },
  { value: 'passed', label: 'Passed' },
] as const;

export const JOB_SENIORITY_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'executive', label: 'Executive' },
  { value: 'c-suite', label: 'C-Suite' },
] as const;

