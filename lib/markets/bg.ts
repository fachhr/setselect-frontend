import type { MarketConfig } from './types';

export const BG_CONFIG: MarketConfig = {
  code: 'BG',
  name: 'Bulgaria',
  flag: '🇧🇬',

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

  joinPath: '/join/bg',

  joinPage: {
    heading: 'Join SetSelect',
    subheading: 'Create your profile and connect with top energy & commodities opportunities in Bulgaria.',
    successBody: "Bulgaria's energy & commodities sector",
  },

  talentPool: {
    title: 'SetSelect – Energy & Commodities Talent Pool Bulgaria',
    description: 'Browse pre-screened energy & commodities talent in Bulgaria.',
    ctaBanner: 'Get seen by leading energy & commodities employers in Bulgaria',
    heroHeadline: 'Energy & Commodities',
    heroHighlight: 'Talent Pool Bulgaria',
  },
};
