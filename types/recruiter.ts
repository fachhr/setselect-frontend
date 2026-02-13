export type RecruiterStatus = 'new' | 'screening' | 'interviewing' | 'offer' | 'placed' | 'rejected';

export interface RecruiterNote {
  id: string;
  text: string;
  author: string;
  created_at: string;
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
  languages: string[] | null;
  work_eligibility: string | null;
  notice_period_months: string;
  highlight: string | null;
  parsing_completed_at: string | null;
  profile_created_at: string;
  // From recruiter_candidates
  status: RecruiterStatus;
  owner: string | null;
  notes: RecruiterNote[];
  status_changed_at: string;
}

export interface RecruiterStats {
  total: number;
  active: number;
  placed: number;
  newThisWeek: number;
}
