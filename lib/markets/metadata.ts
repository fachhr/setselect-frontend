import type { Metadata } from 'next';
import type { Market } from './types';
import { getMarketConfig, MARKETS } from './index';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://setselect.io';

const alternateLanguages = Object.fromEntries(
  MARKETS.map(m => {
    const c = getMarketConfig(m);
    return [`en-${m}`, c.basePath ? `${SITE_URL}${c.basePath}` : SITE_URL];
  })
);

export function talentPoolMetadata(market: Market): Metadata {
  const { talentPool, basePath } = getMarketConfig(market);
  const url = basePath ? `${SITE_URL}${basePath}` : SITE_URL;

  const ogTitle = `${talentPool.title} | SetSelect`;

  return {
    title: talentPool.title,
    description: talentPool.description,
    openGraph: {
      title: ogTitle,
      description: talentPool.description,
      url,
      siteName: 'SetSelect',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: ogTitle,
      description: talentPool.description,
    },
    alternates: {
      canonical: url,
      languages: alternateLanguages,
    },
  };
}

export function joinPageMetadata(market: Market): Metadata {
  const { joinPage } = getMarketConfig(market);
  return {
    title: joinPage.title,
    description: joinPage.description,
  };
}
