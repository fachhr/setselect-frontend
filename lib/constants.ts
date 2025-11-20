import { Candidate, Canton, SelectOption } from '@/types/talentPool';

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

export const CANDIDATES: Candidate[] = [
  {
    id: 'SVL-025',
    role: 'Senior Full Stack Engineer',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    experience: '8 years',
    seniority: 'Senior',
    cantons: ['ZH', 'ZG'],
    salaryMin: 140000,
    salaryMax: 160000,
    availability: 'Immediate',
    entryDate: 'Nov 18, 2025'
  },
  {
    id: 'SVL-024',
    role: 'Frontend Developer',
    skills: ['Vue.js', 'Tailwind', 'Figma'],
    experience: '3 years',
    seniority: 'Mid-level',
    cantons: ['GE', 'VD'],
    salaryMin: 95000,
    salaryMax: 110000,
    availability: '1 Month Notice',
    entryDate: 'Nov 17, 2025'
  },
  {
    id: 'SVL-023',
    role: 'DevOps Engineer',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'Python'],
    experience: '5 years',
    seniority: 'Mid-level',
    cantons: ['ZH', 'BE'],
    salaryMin: 120000,
    salaryMax: 140000,
    availability: 'Immediate',
    entryDate: 'Nov 17, 2025'
  },
  {
    id: 'SVL-022',
    role: 'CTO / VP of Engineering',
    skills: ['Leadership', 'Strategy', 'System Design', 'Go'],
    experience: '12+ years',
    seniority: 'Executive',
    cantons: ['ZH', 'ZG', 'SZ'],
    salaryMin: 180000,
    salaryMax: 250000,
    availability: '3 Months Notice',
    entryDate: 'Nov 16, 2025'
  },
  {
    id: 'SVL-021',
    role: 'Junior Backend Dev',
    skills: ['Java', 'Spring Boot', 'PostgreSQL'],
    experience: '1 year',
    seniority: 'Junior',
    cantons: ['BS', 'BL'],
    salaryMin: 80000,
    salaryMax: 95000,
    availability: 'Immediate',
    entryDate: 'Nov 15, 2025'
  },
  {
    id: 'SVL-020',
    role: 'Product Manager',
    skills: ['Agile', 'Scrum', 'Roadmapping', 'Jira'],
    experience: '6 years',
    seniority: 'Senior',
    cantons: ['ZH'],
    salaryMin: 130000,
    salaryMax: 150000,
    availability: 'Negotiable',
    entryDate: 'Nov 14, 2025'
  }
];

export const CANTONS: Canton[] = [
  { code: 'AG', name: 'Aargau' },
  { code: 'AI', name: 'Appenzell Innerrhoden' },
  { code: 'AR', name: 'Appenzell Ausserrhoden' },
  { code: 'BL', name: 'Basel-Landschaft' },
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'BE', name: 'Bern' },
  { code: 'FR', name: 'Fribourg' },
  { code: 'GE', name: 'Geneva' },
  { code: 'GL', name: 'Glarus' },
  { code: 'GR', name: 'Graubünden' },
  { code: 'JU', name: 'Jura' },
  { code: 'LU', name: 'Lucerne' },
  { code: 'NE', name: 'Neuchâtel' },
  { code: 'NW', name: 'Nidwalden' },
  { code: 'OW', name: 'Obwalden' },
  { code: 'SH', name: 'Schaffhausen' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'SO', name: 'Solothurn' },
  { code: 'SG', name: 'St. Gallen' },
  { code: 'TG', name: 'Thurgau' },
  { code: 'TI', name: 'Ticino' },
  { code: 'UR', name: 'Uri' },
  { code: 'VS', name: 'Valais' },
  { code: 'VD', name: 'Vaud' },
  { code: 'ZG', name: 'Zug' },
  { code: 'ZH', name: 'Zürich' },
];

export const MAIN_CANTON_CODES = ['ZH', 'GE', 'VD', 'BE', 'BS', 'ZG', 'LU', 'SG'];

export const SENIORITY_LEVELS: SelectOption[] = [
  { label: 'Junior (0-2 years)', value: 'Junior' },
  { label: 'Mid-level (3-6 years)', value: 'Mid-level' },
  { label: 'Senior (7+ years)', value: 'Senior' },
  { label: 'Executive / Lead', value: 'Executive' },
];

export const NOTICE_PERIOD_OPTIONS: SelectOption[] = [
  { label: 'Immediate', value: '0' },
  { label: '1 Month', value: '1' },
  { label: '2 Months', value: '2' },
  { label: '3 Months', value: '3' },
  { label: '6 Months', value: '6' },
  { label: 'Negotiable', value: '-1' },
];
