import { z } from 'zod';

const monthYearRegex = /^\d{4}-\d{2}$/;
const invalidMonthYearFormatMessage = "Date must be in YYYY-MM format";

// Schema for Contact Address (JSONB object in database)
const ContactAddressSchema = z.object({
  street: z.string().min(1, { message: "Street address is required" }).nullable(),
  city: z.string().min(1, { message: "City is required" }).nullable(),
  state: z.string().nullable().optional(), // Optional field
  country: z.string().min(1, { message: "Country is required" }).nullable(),
  zip: z.string().min(1, { message: "Zip/Postal code is required" }).nullable(),
}).nullable();

// Schema for Academic Honor
const AcademicHonorSchema = z.object({
  awardName: z.string().min(1, { message: "Award name is required" }),
  issuingOrganization: z.string().optional(),
  dateReceived: z.string().regex(monthYearRegex, { message: invalidMonthYearFormatMessage }).optional().or(z.literal('')),
});

// Schema for Study Abroad Details
const StudyAbroadDetailsSchema = z.object({
  hostInstitution: z.string().min(1, { message: "Host institution is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  startDate: z.string().regex(monthYearRegex, { message: invalidMonthYearFormatMessage }).min(1, { message: "Start date is required" }),
  endDate: z.string().regex(monthYearRegex, { message: invalidMonthYearFormatMessage }).min(1, { message: "End date is required" }),
  programType: z.string().optional(),
}).superRefine((data, ctx) => {
  // Study abroad end date must not be before start date
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start date cannot be after end date.",
      path: ["startDate"],
    });
  }
});

// Schema for Publication
const PublicationSchema = z.object({
  title: z.string().min(1, { message: "Publication title is required" }),
  authors: z.string().optional(),
  publicationType: z.string().optional(),
  venue: z.string().optional(),
  date: z.string().optional(),
  doi: z.string().optional(),
});

// Schema for Society/Organization
const SocietyOrganizationSchema = z.object({
  name: z.string().min(1, { message: "Society/organization name is required" }),
  role: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

// Schema for EducationItem
export const EducationItemSchema = z.object({
  universityName: z.string().min(1, { message: "University name is required" }),
  otherUniversityName: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  generalField: z.string().min(1, { message: "General field of study is required" }),
  specificField: z.string().min(1, { message: "Specific field of study is required" }),
  otherSpecificField: z.string().optional(),
  degreeType: z.string().min(1, { message: "Degree type is required" }),
  overallGrade: z.string().optional(),
  overallGradeValue: z.string().optional(),
  overallGradeMax: z.string().optional(),
  classRank: z.number().optional(),
  classSize: z.number().optional(),
  isCurrent: z.boolean().optional(),
  startDate: z.string().regex(monthYearRegex, { message: invalidMonthYearFormatMessage }).min(1, { message: "Start date is required" }),
  endDate: z.string().regex(monthYearRegex, { message: invalidMonthYearFormatMessage }).optional().or(z.literal('')),
  
  // PhD-specific fields
  researchGroup: z.string().optional(),
  supervisor: z.string().optional(),
  
  // Thesis/Project fields
  thesisProjectName: z.string().optional(),
  thesisProjectDescription: z.string().optional(),
  thesisProjectGradeValue: z.string().optional(),
  thesisProjectGradeMax: z.string().optional(),
  
  // New fields for enhanced education
  academicHonors: z.array(AcademicHonorSchema).optional(),
  hasStudyAbroad: z.boolean().optional(),
  studyAbroadDetails: StudyAbroadDetailsSchema.optional(),
  relevantCoursework: z.array(z.string().min(1, { message: "Course name cannot be empty" })).optional(),
  publications: z.array(PublicationSchema).optional(),
  societiesOrganizations: z.array(SocietyOrganizationSchema).optional(),
}).superRefine((data, ctx) => {
  // If not current, end date is required
  if (!data.isCurrent && !data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date is required if this is not your current institution.",
      path: ["endDate"],
    });
  }
  // If an end date exists, it must not be before the start date
  if (data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date cannot be after end date.",
        path: ["startDate"],
      });
    }
  }
  
  // PhD-specific field validation
  if (data.degreeType === 'PhD') {
    if (!data.researchGroup || data.researchGroup.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Research group/lab name is required for PhD degree",
        path: ["researchGroup"],
      });
    }
    if (!data.supervisor || data.supervisor.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Supervisor/professor name is required for PhD degree",
        path: ["supervisor"],
      });
    }
  }
  
  // If hasStudyAbroad is true, studyAbroadDetails is required
  if (data.hasStudyAbroad === true && !data.studyAbroadDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Study abroad details are required when you indicate you studied abroad.",
      path: ["studyAbroadDetails"],
    });
  }
  
  // Validate academic honors have non-empty award names
  if (data.academicHonors) {
    data.academicHonors.forEach((honor, index) => {
      if (!honor.awardName || honor.awardName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Award name is required",
          path: ["academicHonors", index, "awardName"],
        });
      }
    });
  }
});

// Schema for PAR Contribution
export const PARContributionSchema = z.object({
  challenge: z.string().min(1, { message: "Challenge/goal is required" }),
  actions: z.string().min(1, { message: "Actions taken are required" }),
  results: z.string().min(1, { message: "Results achieved are required" }),
});

// Schema for ExperienceItem
export const ExperienceItemSchema = z.object({
  positionName: z.string().min(1, { message: "Position name is required" }),
  companyName: z.string().min(1, { message: "Company name is required" }),
  city: z.string().min(1, { message: "City is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  positionType: z.string().min(1, { message: "Position type is required" }),
  experienceType: z.enum(['industrial', 'academic']).optional().default('industrial'),
  supervisor: z.string().optional(),
  researchGroup: z.string().optional(),
  researchPartner: z.string().optional(),
  description: z.string().optional(),
  contributions: z.array(PARContributionSchema).min(3, { message: "At least 3 contributions are required" }),
  raw_bullet_points: z.array(z.string()).optional(),
  isCurrent: z.boolean().optional(),
  startDate: z.string().regex(monthYearRegex, { message: invalidMonthYearFormatMessage }).min(1, { message: "Start date is required" }),
  endDate: z.string().regex(monthYearRegex, { message: invalidMonthYearFormatMessage }).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  // If not current, end date is required
  if (!data.isCurrent && !data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date is required if this is not your current position.",
      path: ["endDate"],
    });
  }
  // If an end date exists, it must not be before the start date
  if (data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date cannot be after end date.",
        path: ["startDate"],
      });
    }
  }
});

// Schema for SkillItem (Generic for technical/soft skills)
export const SkillItemSchema = z.object({
  name: z.string().min(1, { message: "Skill name is required" }),
  level: z.string().min(1, { message: "Skill level is required" }),
});

// Schema for IndustrySkillItem
export const IndustrySkillItemSchema = z.object({
  industry: z.string().min(1, { message: "Industry is required" }),
  name: z.string().min(1, { message: "Skill name is required" }),
  level: z.string().min(1, { message: "Skill level is required" }),
});

// Schema for ActivityItem
export const ActivityItemSchema = z.object({
  organization: z.string().min(1, { message: "Organization name is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  achievement: z.string().min(1, { message: "Achievement is required" }),
});

// Schema for ProjectItem
export const ProjectItemSchema = z.object({
  projectName: z.string().min(1, { message: "Project name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  technologies: z.array(z.string()).optional(),
  link: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
});

// Schema for LanguageItem
export const LanguageItemSchema = z.object({
  language: z.string().min(1, { message: "Language is required" }),
  proficiency: z.string().min(1, { message: "Proficiency is required" }),
});

// Schema for CertificationItem
export const CertificationItemSchema = z.object({
  name: z.string().min(1, { message: "Certification name is required" }),
  issuer: z.string().min(1, { message: "Issuing organization is required" }),
  dateObtained: z.string().min(1, { message: "Date obtained is required" }),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().url({ message: "Invalid URL" }).optional().or(z.literal('')),
});

// Main UserProfileSchema
export const UserProfileSchema = z.object({
  full_name: z.string().nullable(), // From Clerk, display-only or initial prefill
  contact_first_name: z.string().min(1, { message: "First name is required" }).nullable(),
  contact_last_name: z.string().min(1, { message: "Last name is required" }).nullable(),
  salutation: z.string().nullable().optional(),
  custom_salutation: z.string().nullable().optional(),
  email: z.string().email({ message: "Invalid email address" }).nullable(),
  country_code: z.string().min(1, {message: "Country code is required"}).nullable(),
  phoneNumber: z.string().min(1, {message: "Phone number is required"}).nullable(),
  contact_address: ContactAddressSchema,
  profile_picture_storage_path: z.string().nullable(),
  years_of_experience: z.string().nullable(),
  education_history: z.array(EducationItemSchema).nullable(),
  professional_experience: z.array(ExperienceItemSchema).nullable(),
  base_languages: z.array(LanguageItemSchema).nullable(),
  technical_skills: z.array(SkillItemSchema).nullable(),
  soft_skills: z.array(SkillItemSchema).nullable(),
  industry_specific_skills: z.array(IndustrySkillItemSchema).nullable(),
  certifications: z.array(CertificationItemSchema).nullable(),
  professional_interests: z.array(z.string()).nullable(),
  extracurricular_activities: z.array(ActivityItemSchema).nullable(),
  base_projects: z.array(ProjectItemSchema).nullable(),
  available_from_date: z.string()
    .nullable()
    .or(z.literal(''))
    .refine(dateStr => {
      // Allow null or empty string
      if (!dateStr || dateStr === '') return true;
      const selectedDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, {
      message: "Available date cannot be in the past."
    }),
  desired_job_types: z.array(z.string()).nullable(),
  desired_locations: z.array(z.string())
    .max(5, { message: "You can select a maximum of 5 locations" })
    .nullable(),
  desired_other_location: z.string().optional().nullable(),
  desired_industries: z.array(z.string())
    .max(5, { message: "You can select a maximum of 5 industries" })
    .nullable(),
  salary_min: z.number().min(0).max(50).nullable().optional(),
  salary_max: z.number().min(0).max(50).nullable().optional(),
  linkedinUrl: z.string().url({ message: "Invalid LinkedIn URL" }).optional().nullable().or(z.literal('')),
  githubUrl: z.string().url({ message: "Invalid GitHub URL" }).optional().nullable().or(z.literal('')),
  portfolioUrl: z.string().url({ message: "Invalid Portfolio URL" }).optional().nullable().or(z.literal('')),
  participates_in_talent_pool: z.boolean().nullable(),
});

// Define schemas for each page of the form for partial validation
export const ProfileContentSchema = UserProfileSchema.pick({
  contact_first_name: true,
  contact_last_name: true,
  salutation: true,
  custom_salutation: true,
  email: true,
  country_code: true,
  phoneNumber: true,
  contact_address: true,
  linkedinUrl: true,
  githubUrl: true,
  portfolioUrl: true,
}).superRefine((data, ctx) => {
  // If "Other" is selected in salutation, custom_salutation is required
  if (data.salutation === 'Other' && (!data.custom_salutation || data.custom_salutation.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your custom salutation",
      path: ["custom_salutation"],
    });
  }
});

export const EducationFormSchema = z.object({
  education_history: z.array(EducationItemSchema).nullable(),
});

export const ExperienceFormSchema = z.object({
  years_of_experience: z.string().nullable(),
  professional_experience: z.array(ExperienceItemSchema).nullable(),
});

export const LanguagesSkillsFormSchema = z.object({
  base_languages: z.array(LanguageItemSchema).nullable(),
  technical_skills: z.array(SkillItemSchema).nullable(),
  soft_skills: z.array(SkillItemSchema).nullable(),
  industry_specific_skills: z.array(IndustrySkillItemSchema).nullable(),
});

export const CertificationsInterestsFormSchema = z.object({
  certifications: z.array(CertificationItemSchema).nullable(),
  professional_interests: z.array(z.string()).nullable(),
});

export const ExtracurricularFormSchema = z.object({
  extracurricular_activities: z.array(ActivityItemSchema).nullable(),
});

export const ProjectsFormSchema = z.object({
  base_projects: z.array(ProjectItemSchema).nullable(),
});

export const OrganizationalFormSchema = z.object({
  available_from_date: z.string()
    .min(1, { message: "Available date is required" })
    .refine(dateStr => {
      const selectedDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, {
      message: "Available date cannot be in the past."
    }),
  desired_job_types: z.array(z.string()).min(1, { message: "At least one job type must be selected" }),
  desired_locations: z.array(z.string())
    .min(1, { message: "At least one location must be selected" })
    .max(5, { message: "You can select a maximum of 5 locations" }),
  desired_other_location: z.string().optional(),
  desired_industries: z.array(z.string())
    .min(1, { message: "At least one industry must be selected" })
    .max(5, { message: "You can select a maximum of 5 industries" }),
  salary_min: z.number().min(0).max(50).optional(),
  salary_max: z.number().min(0).max(50).optional(),
}).superRefine((data, ctx) => {
  // If "Other" is selected in locations, desired_other_location is required
  if (data.desired_locations?.includes('Other') && (!data.desired_other_location || data.desired_other_location.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the other location",
      path: ["desired_other_location"],
    });
  }
});

// SalaryFormSchema is now merged into OrganizationalFormSchema

// No specific validation needed for TermsAgreementForm as it's about boolean flags
// handled directly in the component.