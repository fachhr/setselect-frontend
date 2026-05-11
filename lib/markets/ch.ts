import type { MarketConfig } from './types';

export const CH_CONFIG: MarketConfig = {
  code: 'CH',
  name: 'Switzerland',
  flag: '🇨🇭',

  locations: [
    { code: 'Basel', name: 'Basel' },
    { code: 'Bern', name: 'Bern' },
    { code: 'Geneva', name: 'Geneva' },
    { code: 'Lausanne', name: 'Lausanne' },
    { code: 'Lucerne', name: 'Lucerne' },
    { code: 'Lugano', name: 'Lugano' },
    { code: 'Zug', name: 'Zug' },
    { code: 'Zurich', name: 'Zurich' },
    { code: 'Switzerland', name: 'All Switzerland' },
    { code: 'Remote', name: 'Remote' },
    { code: 'Global', name: 'Global' },
    { code: 'Others', name: 'Others' },
  ],

  workEligibility: [
    { value: 'swiss_citizen', label: 'Swiss Citizen' },
    { value: 'c_permit', label: 'Swiss C Permit' },
    { value: 'eu_efta', label: 'EU/EFTA Citizen' },
    { value: 'b_permit', label: 'Swiss B Permit (Non-EU)' },
    { value: 'g_permit', label: 'Swiss G Permit (Cross-border)' },
    { value: 'requires_sponsorship', label: 'Non-EU / Requires Sponsorship' },
  ],

  languages: ['English', 'German', 'French', 'Italian'],

  currency: { code: 'CHF', locale: 'de-CH', symbol: 'CHF' },

  salaryRange: { min: 60000, max: 500000, step: 10000 },

  popularPhoneCode: '+41',

  basePath: '',
  joinPath: '/join',

  joinPage: {
    title: 'Join the Talent Pool | SetSelect',
    description: 'Create your profile and connect with top energy & commodities opportunities in Switzerland.',
    heading: 'Join SetSelect',
    subheading: 'Create your profile and connect with top energy & commodities opportunities in Switzerland.',
    successBody: "Switzerland's energy & commodities sector",
  },

  talentPool: {
    title: "SetSelect – Switzerland's Leading Energy & Commodities Talent Pool",
    description: 'Browse pre-screened and selected energy & commodities talent in Switzerland. Find and connect with top professionals within just a few clicks.',
    ctaBanner: 'Get seen by leading energy & commodities employers in Switzerland',
    heroHeadline: "Switzerland's Leading",
    heroHighlight: 'Energy & Commodities Talent Pool',
    heroSubtitle: 'Browse pre‑screened and selected talent. Within just a few clicks, get contact information of the candidates you like.',
    joinPoolDescription: 'Get discovered by top employers in the energy and commodities sector.',
  },
};
