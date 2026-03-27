export type RecruiterStatus = 'new' | 'screening' | 'interviewing' | 'offer' | 'placed' | 'rejected';

export interface RecruiterNote {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

// --- Activity Feed types (discriminated union) ---

interface ActivityEntryBase {
  id: string;
  author: string;
  created_at: string;
}

export interface NoteEntry extends ActivityEntryBase {
  type: 'note';
  text: string;
}

export interface StatusChangeEntry extends ActivityEntryBase {
  type: 'status_change';
  from: RecruiterStatus;
  to: RecruiterStatus;
  comment?: string;
}

export interface SubmissionCreatedEntry extends ActivityEntryBase {
  type: 'submission_created';
  company_name: string;
  submission_id: string;
}

export interface SubmissionUpdateEntry extends ActivityEntryBase {
  type: 'submission_update';
  company_name: string;
  submission_id: string;
  from: SubmissionStatus;
  to: SubmissionStatus;
}

export type ActivityEntry = NoteEntry | StatusChangeEntry | SubmissionCreatedEntry | SubmissionUpdateEntry;

/** Normalize legacy RecruiterNote (no type field) into ActivityEntry */
export function toActivityEntry(raw: RecruiterNote | ActivityEntry): ActivityEntry {
  if ('type' in raw) return raw as ActivityEntry;
  return { ...raw, type: 'note' as const };
}

export interface LanguageEntry {
  language: string;
  proficiency?: string;
}

export interface RecruiterCandidateView {
  // From user_profiles
  profile_id: string;
  talent_id: string | null;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  country_code: string;
  phoneNumber: string;
  linkedinUrl: string | null;
  years_of_experience: number;
  desired_roles: string | null;
  desired_locations: string[];
  salary_min: number | null;
  salary_max: number | null;
  cv_storage_path: string;
  cv_original_filename: string;
  profile_bio: string | null;
  short_summary: string | null;
  education_history: Record<string, unknown>[] | null;
  professional_experience: Record<string, unknown>[] | null;
  technical_skills: Record<string, unknown>[] | null;
  functional_expertise: string[] | null;
  languages: LanguageEntry[] | null;
  work_eligibility: string | null;
  notice_period_months: string;
  highlight: string | null;
  parsing_completed_at: string | null;
  profile_created_at: string;
  // From recruiter_candidates
  status: RecruiterStatus;
  owner: string | null;
  notes: (RecruiterNote | ActivityEntry)[];
  status_changed_at: string;
  is_favorite: boolean;
  last_activity_at?: string;
}

export interface ProfileEditData {
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  country_code: string;
  phoneNumber: string;
  linkedinUrl: string;
  years_of_experience: string;
  desired_roles: string;
  desired_locations: string[];
  salary_min: string;
  salary_max: string;
  notice_period_months: string;
  work_eligibility: string;
  short_summary: string;
  functional_expertise: string[];
  languages: LanguageEntry[];
}

export interface RecruiterStats {
  total: number;
  active: number;
  placed: number;
  newThisWeek: number;
}

export type SubmissionStatus = 'submitted' | 'interviewing' | 'rejected' | 'placed';

export interface CandidateSubmission {
  id: string;
  profile_id: string;
  company_id: string;
  company_name: string;
  submitted_by: string | null;
  status: SubmissionStatus;
  notes: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface CompanyAccount {
  id: string;
  company_name: string;
  contact_email: string;
  invited_by: string | null;
  invited_at: string;
  last_sign_in_at: string | null;
}

export interface SubmissionCompany {
  id: string;
  name: string;
  created_at: string;
}
