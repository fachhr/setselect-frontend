import type { MetadataRoute } from 'next';
import { MARKETS, getMarketConfig } from '@/lib/markets';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://setselect.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const market of MARKETS) {
    const { basePath, joinPath } = getMarketConfig(market);
    const prefix = basePath ? `${SITE_URL}${basePath}` : SITE_URL;

    entries.push(
      { url: prefix, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${SITE_URL}${joinPath}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    );
  }

  const staticPages = ['/terms', '/privacy', '/cookies', '/impressum', '/contact'];
  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    });
  }

  return entries;
}
