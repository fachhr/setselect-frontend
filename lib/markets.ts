export type Market = 'CH' | 'BG';

export interface MarketConfig {
  code: Market;
  name: string;
  workEligibility: { value: string; label: string }[];
  locations: { value: string; label: string }[];
  currency: { code: string; symbol: string };
  languages: string[];
  phoneCode: string;
  salaryRange: { min: number; max: number; step: number };
}

const CH_CONFIG: MarketConfig = {
  code: 'CH',
  name: 'Switzerland',
  workEligibility: [
    { value: 'swiss_citizen', label: 'Swiss Citizen' },
    { value: 'c_permit', label: 'C Permit' },
    { value: 'eu_efta', label: 'EU/EFTA' },
    { value: 'b_permit', label: 'B Permit' },
    { value: 'g_permit', label: 'G Permit' },
    { value: 'requires_sponsorship', label: 'Requires Sponsorship' },
  ],
  locations: [
    { value: 'Basel', label: 'Basel' },
    { value: 'Bern', label: 'Bern' },
    { value: 'Geneva', label: 'Geneva' },
    { value: 'Lausanne', label: 'Lausanne' },
    { value: 'Lucerne', label: 'Lucerne' },
    { value: 'Lugano', label: 'Lugano' },
    { value: 'Zug', label: 'Zug' },
    { value: 'Zurich', label: 'Zurich' },
    { value: 'Switzerland', label: 'All Switzerland' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Global', label: 'Global' },
  ],
  currency: { code: 'CHF', symbol: 'CHF' },
  languages: ['English', 'German', 'French', 'Italian'],
  phoneCode: '+41',
  salaryRange: { min: 60000, max: 500000, step: 10000 },
};

const BG_CONFIG: MarketConfig = {
  code: 'BG',
  name: 'Bulgaria',
  workEligibility: [
    { value: 'bg_citizen', label: 'Bulgarian Citizen' },
    { value: 'eu_citizen', label: 'EU Citizen' },
    { value: 'bg_permanent', label: 'Permanent Residence' },
    { value: 'bg_work_permit', label: 'Work Permit' },
    { value: 'blue_card', label: 'Blue Card' },
    { value: 'requires_sponsorship', label: 'Requires Sponsorship' },
  ],
  locations: [
    { value: 'Sofia', label: 'Sofia' },
    { value: 'Plovdiv', label: 'Plovdiv' },
    { value: 'Varna', label: 'Varna' },
    { value: 'Burgas', label: 'Burgas' },
    { value: 'Stara Zagora', label: 'Stara Zagora' },
    { value: 'Ruse', label: 'Ruse' },
    { value: 'Pleven', label: 'Pleven' },
    { value: 'Bulgaria', label: 'All Bulgaria' },
    { value: 'Remote', label: 'Remote' },
  ],
  currency: { code: 'BGN', symbol: 'лв.' },
  languages: ['English', 'Bulgarian', 'German', 'Russian'],
  phoneCode: '+359',
  salaryRange: { min: 20000, max: 200000, step: 5000 },
};

const MARKET_CONFIGS: Record<Market, MarketConfig> = { CH: CH_CONFIG, BG: BG_CONFIG };

export const MARKETS: Market[] = ['CH', 'BG'];

export function getMarketConfig(market: Market): MarketConfig {
  return MARKET_CONFIGS[market];
}
