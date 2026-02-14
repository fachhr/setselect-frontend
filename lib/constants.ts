export const WORK_ELIGIBILITY_OPTIONS = [
  { value: 'swiss_citizen', label: 'Swiss Citizen' },
  { value: 'c_permit', label: 'C Permit' },
  { value: 'eu_efta', label: 'EU/EFTA' },
  { value: 'b_permit', label: 'B Permit' },
  { value: 'g_permit', label: 'G Permit' },
  { value: 'requires_sponsorship', label: 'Requires Sponsorship' },
] as const;

export const WORK_ELIGIBILITY_LABELS: Record<string, string> = {
  swiss_citizen: 'Swiss Citizen',
  c_permit: 'Swiss C Permit',
  eu_efta: 'EU/EFTA Citizen',
  b_permit: 'Swiss B Permit (Non-EU)',
  g_permit: 'Swiss G Permit (Cross-border)',
  requires_sponsorship: 'Non-EU / Requires Sponsorship',
};

export const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export const LANGUAGE_OPTIONS = ['English', 'German', 'French', 'Italian'] as const;
