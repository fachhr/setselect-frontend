import { z } from 'zod';

/**
 * Validation schema for Silvia's List Talent Pool signup form
 *
 * This schema validates all user-provided fields (12 fields total):
 * - Contact details (6 fields)
 * - Job preferences (5 fields)
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

  years_of_experience: z.number({
    required_error: 'Years of experience is required',
    invalid_type_error: 'Please enter a valid number'
  })
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Please enter a value between 0 and 50')
    .int('Please enter a whole number'),

  // Work eligibility / permit status
  work_eligibility: z.string()
    .min(1, 'Please select your work eligibility'),

  // ============================================
  // JOB PREFERENCES (user-provided, required)
  // ============================================

  // Desired roles (text input)
  desired_roles: z.string()
    .min(1, 'Please describe your desired role(s)')
    .max(200, 'Role description must be less than 200 characters')
    .trim(),

  // Notice period in months
  notice_period_months: z.string()
    .min(1, 'Please select your notice period'),

  // Locations (at least 1 required, max 5)
  desired_locations: z.array(z.string())
    .min(1, 'Please select at least one preferred location')
    .max(5, 'You can select up to 5 locations'),

  desired_other_location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  // Languages with professional proficiency (simple checkboxes)
  languages: z.array(z.string()).optional(),

  // Other language (text input when "Other" is selected)
  other_language: z.string()
    .max(50, 'Language name must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  // Key achievement / career highlight (optional)
  highlight: z.string()
    .max(300, 'Achievement must be less than 300 characters')
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
    // Only validate if both salary values are provided
    if (data.salary_min != null && data.salary_max != null) {
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
