import type { MarketConfig } from './types';

export const BG_CONFIG: MarketConfig = {
  code: 'BG',
  name: 'Bulgaria',
  flag: '🇧🇬',
  tagline: 'Senior & Executive Recruitment',

  locations: [
    { code: 'Sofia', name: 'Sofia' },
    { code: 'Plovdiv', name: 'Plovdiv' },
    { code: 'Varna', name: 'Varna' },
    { code: 'Burgas', name: 'Burgas' },
    { code: 'Stara Zagora', name: 'Stara Zagora' },
    { code: 'Ruse', name: 'Ruse' },
    { code: 'Pleven', name: 'Pleven' },
    { code: 'Bulgaria', name: 'All Bulgaria' },
    { code: 'Remote', name: 'Remote' },
    { code: 'Others', name: 'Others' },
  ],

  workEligibility: [
    { value: 'bg_citizen', label: 'Bulgarian Citizen' },
    { value: 'eu_citizen', label: 'EU Citizen' },
    { value: 'bg_permanent', label: 'Permanent Residence Permit' },
    { value: 'bg_work_permit', label: 'Work Permit' },
    { value: 'blue_card', label: 'EU Blue Card' },
    { value: 'requires_sponsorship', label: 'Non-EU / Requires Sponsorship' },
  ],

  languages: ['English', 'Bulgarian', 'German', 'Russian'],

  currency: { code: 'BGN', locale: 'bg-BG', symbol: 'лв.' },

  salaryRange: { min: 20000, max: 200000, step: 5000 },

  popularPhoneCode: '+359',

  basePath: '/bg',
  joinPath: '/join/bg',

  joinPage: {
    title: 'Join the Talent Pool – Bulgaria',
    description: 'Create your profile and connect with top opportunities in Bulgaria.',
    heading: 'Join SetSelect',
    subheading: 'Create your profile and connect with top opportunities in Bulgaria.',
    successBody: "Bulgaria's professional talent market",
  },

  talentPool: {
    title: 'Senior & Executive Talent in Bulgaria',
    description: 'Browse pre-screened senior & executive talent in Bulgaria. Find and connect with top professionals within just a few clicks.',
    ctaBanner: 'Get seen by leading employers in Bulgaria',
    heroHeadline: 'Senior & Executive',
    heroHighlight: 'Talent in Bulgaria',
    heroSubtitle: 'Access carefully selected professionals across leadership, technology, operations, commercial, and strategic roles.',
    joinPoolDescription: 'Get discovered by top employers in Bulgaria.',
  },
};
