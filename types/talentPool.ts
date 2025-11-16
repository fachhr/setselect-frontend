/**
 * Type definitions for Silvia's List Talent Pool
 */

export interface TalentPoolProfile {
  id: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  linkedinUrl?: string | null;
  country_code: string;
  phoneNumber: string;
  years_of_experience?: string | null; // Extracted by CV parser
  working_capacity_percent: number;
  available_from_date: string;
  desired_duration_months: string;
  desired_job_types: string[];
  desired_locations: string[];
  desired_other_location?: string | null;
  desired_industries: string[];
  salary_min?: number | null;
  salary_max?: number | null;
  cv_storage_path: string;
  cv_original_filename: string;
  accepted_terms: boolean;
  accepted_terms_at: string;
  created_at: string;
  parsing_completed_at?: string | null;
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
