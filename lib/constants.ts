/**
 * Shared application constants
 * Centralized to avoid duplication and ensure consistency
 */

// ====================
// SALARY CONSTANTS
// ====================
export const SALARY_MIN = 60000;
export const SALARY_MAX = 250000;
export const SALARY_STEP = 5000;

// ====================
// PAGINATION CONSTANTS
// ====================
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ====================
// FILE UPLOAD CONSTANTS
// ====================
export const MAX_CV_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const VALID_CV_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

export const VALID_CV_EXTENSIONS = ['pdf', 'docx'] as const;

export const MIME_TO_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
};

// ====================
// SENIORITY CONSTANTS
// ====================
export const SENIORITY_RANGES = {
  junior: { min: 0, max: 2 },
  mid: { min: 3, max: 6 },
  senior: { min: 7, max: null } // null = no upper limit
} as const;
