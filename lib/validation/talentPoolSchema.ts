import { z } from 'zod';

/**
 * Validation schema for Silvia's List Talent Pool signup form
 *
 * This schema validates all user-provided fields (13 fields total):
 * - Contact details (5 fields)
 * - Job preferences (7 fields)
 * - CV upload
 * - Terms acceptance
 */
export const talentPoolSchema = z.object({
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
    .regex(/^[0-9\s\-\(\)]+$/, 'Phone number can only contain numbers, spaces, and hyphens')
    .trim(),

  // ============================================
  // JOB PREFERENCES (user-provided, required)
  // ============================================

  // Working capacity (10-100%)
  working_capacity_percent: z.number()
    .min(10, 'Working capacity must be at least 10%')
    .max(100, 'Working capacity cannot exceed 100%'),

  // Available from date
  available_from_date: z.string()
    .min(1, 'Please select your availability date')
    .refine((date) => {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return dateRegex.test(date);
    }, {
      message: 'Invalid date format'
    }),

  // Desired duration
  desired_duration_months: z.string()
    .min(1, 'Please select your desired contract duration'),

  // Locations (at least 1 required, max 5)
  desired_locations: z.array(z.string())
    .min(1, 'Please select at least one preferred location')
    .max(5, 'You can select up to 5 locations'),

  desired_other_location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  // Salary expectation (always has default values from sliders)
  salary_min: z.number()
    .min(0, 'Minimum salary cannot be negative'),

  salary_max: z.number()
    .min(0, 'Maximum salary cannot be negative'),

  salary_confidential: z.boolean()
    .default(false),

  // ============================================
  // CV UPLOAD (required)
  // ============================================

  cvFile: z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    return true;
  }, {
    message: 'Please upload your CV'
  })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'CV file must be less than 5MB'
    })
    .refine((file) => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return validTypes.includes(file.type);
    }, {
      message: 'CV must be a PDF or DOCX file'
    }),

  // ============================================
  // TERMS & CONDITIONS (required)
  // ============================================

  accepted_terms: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the terms and conditions to continue'
    })
  }),
});

/**
 * Refine schema to validate salary range logic
 */
export const talentPoolSchemaRefined = talentPoolSchema.refine(
  (data) => {
    // If salary is not confidential and both min/max are provided,
    // ensure min is less than or equal to max
    if (!data.salary_confidential && data.salary_min && data.salary_max) {
      return data.salary_min <= data.salary_max;
    }
    return true;
  },
  {
    message: 'Minimum salary cannot be greater than maximum salary',
    path: ['salary_min']
  }
);

/**
 * TypeScript type inferred from the schema
 */
export type TalentPoolFormData = z.infer<typeof talentPoolSchema>;

/**
 * Type for the refined schema
 */
export type TalentPoolFormDataRefined = z.infer<typeof talentPoolSchemaRefined>;

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
});

export const talentPoolPreferencesSchema = talentPoolSchema.pick({
  working_capacity_percent: true,
  available_from_date: true,
  desired_duration_months: true,
  desired_locations: true,
  desired_other_location: true,
  salary_min: true,
  salary_max: true,
  salary_confidential: true,
});

export const talentPoolCVSchema = talentPoolSchema.pick({
  cvFile: true,
});

export const talentPoolTermsSchema = talentPoolSchema.pick({
  accepted_terms: true,
});
