import type { Market, MarketConfig } from './types';
import { CH_CONFIG } from './ch';
import { BG_CONFIG } from './bg';

const MARKET_CONFIGS: Record<Market, MarketConfig> = {
  CH: CH_CONFIG,
  BG: BG_CONFIG,
};

export const MARKETS: Market[] = Object.keys(MARKET_CONFIGS) as Market[];

export function getMarketConfig(market: Market): MarketConfig {
  return MARKET_CONFIGS[market];
}

export function getMarketFromPathname(pathname: string): Market {
  for (const market of MARKETS) {
    const { basePath } = MARKET_CONFIGS[market];
    if (basePath && (pathname === basePath || pathname.startsWith(basePath + '/'))) {
      return market;
    }
  }
  return 'CH';
}

export function isValidMarket(value: string): value is Market {
  return value in MARKET_CONFIGS;
}

export const ALL_WORK_ELIGIBILITY_VALUES = MARKETS.flatMap(
  m => MARKET_CONFIGS[m].workEligibility.map(e => e.value)
);

export const ALL_LOCATION_CODES = MARKETS.flatMap(
  m => MARKET_CONFIGS[m].locations.map(l => l.code)
);

export type { Market, MarketConfig } from './types';
