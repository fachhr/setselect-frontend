export const COMPANY = {
  legalName: 'Setberry Filipova',
  tradingAs: 'SetSelect',
  legalForm: 'Sole proprietorship',
  registerNumber: 'CH-400.1.613.380-9',
  uid: 'CHE-492.781.844',
  address: {
    street: 'Am Gottesgraben 11',
    postalCode: '5430',
    city: 'Wettingen',
    canton: 'AG',
    country: 'Switzerland',
  },
  jurisdiction: 'Aargau',
  owner: 'Silvia Filipova',
  contacts: {
    privacy: 'hello@setberry.com',
    legal: 'hello@setberry.com',
    support: 'hello@setberry.com',
  },
  terms: {
    lastUpdated: '2026-01-29',
    effectiveDate: '2026-01-29',
    nextReview: 'Reviewed quarterly',
  },
  privacyPolicy: {
    lastUpdated: '2026-01-29',
    effectiveDate: '2026-01-29',
  },
  cookiePolicy: {
    lastUpdated: '2026-01-29',
  },
  platformUrl: 'https://setselect.io',
  licenses: {
    cantonal: 'Zurich (received)',
    seco: 'Pending',
  },
  liabilityCap: 'CHF 500',
  inactivityPeriodMonths: 60,
  dataRetentionYears: 10,
} as const;

export const THIRD_PARTY_PROCESSORS = [
  {
    provider: 'Supabase',
    role: 'Database infrastructure',
    purpose: 'Storing CV/profile data',
  },
  {
    provider: 'Vercel',
    role: 'Hosting + Analytics',
    purpose: 'Hosting platform interface, website usage analytics (with consent)',
  },
  {
    provider: 'Railway',
    role: 'Application infrastructure',
    purpose: 'Running platform services',
  },
  {
    provider: 'OpenAI',
    role: 'AI services',
    purpose: 'Profile analysis and anonymisation',
  },
  {
    provider: 'Google reCAPTCHA',
    role: 'Security',
    purpose: 'Form spam prevention (essential)',
  },
] as const;

export const FDPIC_CONTACT = {
  name: 'Swiss Federal Data Protection and Information Commissioner (FDPIC)',
  address: 'Freiburgstrasse 338, 3012 Bern, Switzerland',
  website: 'https://www.edoeb.admin.ch/edoeb/en/home.html',
  complaints: 'https://www.edoeb.admin.ch/edoeb/en/home/data-protection-complaints.html',
} as const;
