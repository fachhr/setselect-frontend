export type Market = 'CH' | 'BG';

export interface MarketConfig {
  code: Market;
  name: string;
  flag: string;

  // Form options
  locations: { code: string; name: string }[];
  workEligibility: { value: string; label: string }[];
  languages: readonly string[];

  // Currency
  currency: { code: string; locale: string; symbol: string };

  // Salary bounds (for input hints / validation)
  salaryRange: { min: number; max: number; step: number };

  // Phone code to promote to top of country codes list
  popularPhoneCode: string;

  // Routes
  basePath: string;
  joinPath: string;

  // Copy
  joinPage: {
    title: string;
    description: string;
    heading: string;
    subheading: string;
    successBody: string;
  };
  talentPool: {
    title: string;
    description: string;
    ctaBanner: string;
    heroHeadline: string;
    heroHighlight: string;
    heroSubtitle: string;
    joinPoolDescription: string;
  };
}
