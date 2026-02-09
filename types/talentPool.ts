/**
 * Type definitions for SetSelect Talent Pool
 */

export interface Candidate {
  id: string;
  role: string;
  skills: string[];
  experience: string;
  seniority: string;
  cantons: string[];
  salaryMin: number;
  salaryMax: number;
  availability: string;
  entryDate: string;
  // New fields from sample integration
  highlight?: string;           // Key achievement quote (from form)
  functionalExpertise?: string[]; // e.g., ['Quant', 'Tech', 'Trading'] (from CV parser)
  education?: string;           // e.g., 'MSc Computer Science, ETH Zurich' (from CV parser)
  workPermit?: string;          // e.g., 'Swiss G Permit' (from form)
  languages?: string[];         // e.g., ['English', 'German'] (from form)
  profileBio?: string;          // AI-generated professional summary (from parser)
  shortSummary?: string;        // AI-generated 2-sentence summary for cards (from parser)
  previousRoles?: { role: string; duration: string; location?: string }[]; // Anonymized job history
}

export interface Canton {
  code: string;
  name: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface TalentPoolProfile {
  id: string;
  talent_id?: string | null; // Format: REF-001, REF-002, etc.
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  linkedinUrl?: string | null;
  country_code: string;
  phoneNumber: string;
  years_of_experience: number;
  notice_period_months: string;
  desired_job_types: string[];
  desired_locations: string[];
  desired_industries: string[];
  salary_min?: number | null;
  salary_max?: number | null;
  cv_storage_path: string;
  cv_original_filename: string;
  accepted_terms: boolean;
  accepted_terms_at: string;
  created_at: string;
  parsing_completed_at?: string | null;
  // New fields from sample integration
  work_eligibility?: string | null;
  desired_roles?: string | null;
  highlight?: string | null;
  languages?: string[] | null;
  functional_expertise?: string[] | null;
  profile_bio?: string | null;  // AI-generated professional summary
  short_summary?: string | null;  // AI-generated 2-sentence summary for cards
  previous_roles?: { role: string; duration: string; location?: string }[] | null; // Anonymized job history
}

// Display-only profile from talent_profiles table (zero PII)
export interface TalentProfile {
  id: string;
  profile_id: string;
  talent_id: string | null;
  years_of_experience: number | null;
  work_eligibility: string | null;
  desired_roles: string | null;
  notice_period_months: string | null;
  desired_locations: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  highlight: string | null;
  languages: string[] | null;
  functional_expertise: string[] | null;
  other_expertise: string | null;
  profile_bio: string | null;
  short_summary: string | null;
  education_history: Record<string, unknown>[] | null;
  professional_experience: Record<string, unknown>[] | null; // companyName stripped
  technical_skills: Record<string, unknown>[] | null;
  soft_skills: Record<string, unknown>[] | null;
  industry_specific_skills: Record<string, unknown>[] | null;
  certifications: Record<string, unknown>[] | null;
  professional_interests: Record<string, unknown>[] | null;
  extracurricular_activities: Record<string, unknown>[] | null;
  base_projects: Record<string, unknown>[] | null;
  base_languages: Record<string, unknown>[] | null;
  parsing_completed_at: string | null;
  created_at: string;
}

export interface CVUploadResponse {
  success: boolean;
  profileId: string;
  cvStoragePath: string;
  originalFilename: string;
}

export interface ProfileSubmitResponse {
  success: boolean;
  profileId: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export type ApiResponse<T> = T | ApiError;

// Seniority levels for talent pool categorization
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'not_specified';

// Anonymized talent profile for public display
export interface AnonymizedTalentProfile {
  talent_id: string;
  entry_date: string; // ISO date string
  years_of_experience: number | null;
  preferred_cantons: string[];
  salary_range: {
    min: number | null;
    max: number | null;
  };
  seniority_level: SeniorityLevel;
  // New fields from sample integration
  highlight?: string | null;
  functional_expertise?: string[] | null;
  education?: string | null;
  work_eligibility?: string | null;
  languages?: string[] | null;
  desired_roles?: string | null;
  profile_bio?: string | null;  // AI-generated professional summary
  short_summary?: string | null;  // AI-generated 2-sentence summary for cards
  previous_roles?: { role: string; duration: string; location?: string }[] | null; // Anonymized job history
}

// Talent pool list response
export interface TalentPoolListResponse {
  success: boolean;
  data: {
    candidates: AnonymizedTalentProfile[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
    filters_applied: {
      seniority?: SeniorityLevel;
      cantons?: string[];
      salary_min?: number;
      salary_max?: number;
    };
  };
}

// Talent pool list query parameters
export interface TalentPoolQueryParams {
  seniority?: SeniorityLevel | 'all';
  cantons?: string;
  salary_min?: number;
  salary_max?: number;
  languages?: string;         // Comma-separated language filter
  work_eligibility?: string;  // Comma-separated work eligibility filter
  sort_by?: 'talent_id' | 'created_at' | 'years_of_experience' | 'salary_max';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
