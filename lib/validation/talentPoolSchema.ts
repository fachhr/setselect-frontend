import { z } from 'zod';
import {
  MAX_CV_FILE_SIZE,
  VALID_CV_MIME_TYPES,
  WORK_ELIGIBILITY_VALUES,
  NOTICE_PERIOD_VALUES,
  WORK_LOCATION_CODES,
  FUNCTIONAL_EXPERTISE_OPTIONS
} from '@/lib/formOptions';

/**
 * Base schema for SetSelect Talent Pool - shared fields between client and server
 *
 * This schema validates all user-provided fields:
 * - Contact details (8 fields)
 * - Job preferences (8 fields)
 * - Terms acceptance
 */
export const talentPoolBaseSchema = z.object({
  // ============================================
  // CONTACT DETAILS (user-provided, required)
  // ============================================

  contact_first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),

  contact_last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),

  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),

  linkedinUrl: z.union([
    z.string()
      .url('Please enter a valid LinkedIn URL')
      .refine((url) => url.includes('linkedin.com'), {
        message: 'Please enter a valid LinkedIn profile URL'
      }),
    z.literal('')
  ]).optional(),

  country_code: z.string()
    .min(1, 'Please select a country code'),

  phoneNumber: z.string()
    .min(5, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[0-9]+$/, 'Phone number can only contain numbers')
    .trim(),

  years_of_experience: z.number({
    required_error: 'Years of experience is required',
    invalid_type_error: 'Please enter a valid number'
  })
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Please enter a value between 0 and 50')
    .int('Please enter a whole number'),

  // Work eligibility / permit status
  work_eligibility: z.enum(WORK_ELIGIBILITY_VALUES, {
    errorMap: () => ({ message: 'Please select your work eligibility' })
  }),

  // ============================================
  // JOB PREFERENCES (user-provided, required)
  // ============================================

  // Desired roles (text input)
  desired_roles: z.string()
    .min(1, 'Please describe your desired role(s)')
    .max(200, 'Role description must be less than 200 characters')
    .trim(),

  // Notice period in months
  notice_period_months: z.enum(NOTICE_PERIOD_VALUES, {
    errorMap: () => ({ message: 'Please select your notice period' })
  }),

  // Locations (at least 1 required, max 5)
  desired_locations: z.array(z.enum(WORK_LOCATION_CODES))
    .min(1, 'Please select at least one preferred location')
    .max(5, 'You can select up to 5 locations'),

  desired_other_location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  // Languages with professional proficiency (simple checkboxes)
  languages: z.array(z.string()).optional(),

  // Other languages (semicolon-separated, e.g. "Spanish; Portuguese; Mandarin")
  other_language: z.string()
    .max(200, 'Languages must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  // Key achievement / career highlight (optional)
  highlight: z.string()
    .max(300, 'Achievement must be less than 300 characters')
    .optional()
    .or(z.literal('')),

  // Functional expertise areas (1-5 required)
  functional_expertise: z.array(z.enum(FUNCTIONAL_EXPERTISE_OPTIONS))
    .min(1, 'Please select at least one area of expertise')
    .max(5, 'Please select up to 5 areas of expertise'),

  // Free-text for "Other" expertise (semicolon-separated)
  other_expertise: z.string()
    .max(200, 'Other expertise must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  // Salary expectation (optional number inputs)
  salary_min: z.number({
    invalid_type_error: 'Please enter a valid number'
  })
    .min(1, 'Minimum salary must be at least 1 CHF')
    .nullable()
    .optional(),

  salary_max: z.number({
    invalid_type_error: 'Please enter a valid number'
  })
    .min(1, 'Maximum salary must be at least 1 CHF')
    .nullable()
    .optional(),

  // ============================================
  // TERMS & CONDITIONS (required)
  // ============================================

  accepted_terms: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the terms and conditions to continue'
    })
  }),
});

// ============================================
// CLIENT-SIDE SCHEMA (with File validation)
// ============================================

/**
 * Client-side schema with cvFile as File object
 * Used by react-hook-form for client-side validation
 */
export const talentPoolSchema = talentPoolBaseSchema.extend({
  cvFile: z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    return true;
  }, {
    message: 'Please upload your CV'
  })
    .refine((file) => file.size <= MAX_CV_FILE_SIZE, {
      message: 'CV file must be less than 5MB'
    })
    .refine((file) => {
      return VALID_CV_MIME_TYPES.includes(file.type as typeof VALID_CV_MIME_TYPES[number]);
    }, {
      message: 'CV must be a PDF or DOCX file'
    }),
});

// ============================================
// SERVER-SIDE SCHEMA (with storage path)
// ============================================

/**
 * Server-side schema with cvStoragePath instead of File
 * Used by API routes after file upload is complete
 */
export const talentPoolServerSchema = talentPoolBaseSchema.extend({
  cvStoragePath: z.string().min(1, 'CV storage path is required'),
  originalFilename: z.string().min(1, 'Original filename is required'),
  languages: z.array(z.string()).nullable().optional(), // Server receives processed languages
  functional_expertise: z.array(z.string()).min(1).max(5), // Server receives string array
  other_expertise: z.string().max(200).optional().or(z.literal('')),
});

// ============================================
// REFINED SCHEMAS (with salary validation)
// ============================================

const salaryRefinement = (data: { salary_min?: number | null; salary_max?: number | null }) => {
  if (data.salary_min != null && data.salary_max != null) {
    return data.salary_min <= data.salary_max;
  }
  return true;
};

const salaryRefinementConfig = {
  message: 'Minimum salary cannot be greater than maximum salary',
  path: ['salary_min']
};

const otherLocationRefinement = (data: { desired_locations: readonly string[]; desired_other_location?: string }) => {
  if (data.desired_locations.includes('Others')) {
    return data.desired_other_location && data.desired_other_location.trim().length > 0;
  }
  return true;
};

const otherLocationRefinementConfig = {
  message: 'Please specify your preferred location',
  path: ['desired_other_location']
};



const languageRefinement = (data: { languages?: string[] | null; other_language?: string | null }) => {
  const hasSelectedLanguage = data.languages && data.languages.length > 0;
  const hasOtherLanguage = data.other_language && data.other_language.trim().length > 0;
  return hasSelectedLanguage || hasOtherLanguage;
};

const languageRefinementConfig = {
  message: "Please select at least one language or specify one in 'Other'",
  path: ['languages']
};

const otherExpertiseRefinement = (data: { functional_expertise: readonly string[]; other_expertise?: string | null }) => {
  if (data.functional_expertise.includes('Other')) {
    return data.other_expertise && data.other_expertise.trim().length > 0;
  }
  return true;
};

const otherExpertiseRefinementConfig = {
  message: 'Please specify your other expertise areas',
  path: ['other_expertise']
};

/**
 * Client-side refined schema with salary and location validation
 */
export const talentPoolSchemaRefined = talentPoolSchema
  .refine(salaryRefinement, salaryRefinementConfig)
  .refine(otherLocationRefinement, otherLocationRefinementConfig)
  .refine(languageRefinement, languageRefinementConfig)
  .refine(otherExpertiseRefinement, otherExpertiseRefinementConfig);

/**
 * Server-side refined schema with salary and location validation
 */
export const talentPoolServerSchemaRefined = talentPoolServerSchema
  .refine(salaryRefinement, salaryRefinementConfig)
  .refine(otherLocationRefinement, otherLocationRefinementConfig)
  .refine(languageRefinement, languageRefinementConfig)
  .refine(otherExpertiseRefinement, otherExpertiseRefinementConfig);

// ============================================
// TYPESCRIPT TYPES
// ============================================

/**
 * Client-side form data type (with File)
 */
export type TalentPoolFormData = z.infer<typeof talentPoolSchema>;

/**
 * Client-side refined form data type
 */
export type TalentPoolFormDataRefined = z.infer<typeof talentPoolSchemaRefined>;

/**
 * Server-side submission data type (with storage path)
 */
export type TalentPoolServerData = z.infer<typeof talentPoolServerSchema>;

/**
 * Server-side refined data type
 */
export type TalentPoolServerDataRefined = z.infer<typeof talentPoolServerSchemaRefined>;

/**
 * Partial schema for step-by-step validation
 */
export const talentPoolContactSchema = talentPoolSchema.pick({
  contact_first_name: true,
  contact_last_name: true,
  email: true,
  linkedinUrl: true,
  country_code: true,
  phoneNumber: true,
  years_of_experience: true,
  work_eligibility: true,
});

export const talentPoolPreferencesSchema = talentPoolSchema.pick({
  desired_roles: true,
  notice_period_months: true,
  desired_locations: true,
  desired_other_location: true,
  languages: true,
  other_language: true,
  highlight: true,
  salary_min: true,
  salary_max: true,
});

export const talentPoolCVSchema = talentPoolSchema.pick({
  cvFile: true,
});

export const talentPoolTermsSchema = talentPoolSchema.pick({
  accepted_terms: true,
});
