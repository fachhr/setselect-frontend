import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HomeContent from '@/components/home/HomeContent';
import { MARKET_FLAGS } from '@/lib/featureFlags';

export const metadata: Metadata = {
  title: 'SetSelect – Energy & Commodities Talent Pool Bulgaria',
  description:
    'Browse pre-screened energy & commodities talent in Bulgaria. Find and connect with top professionals within just a few clicks.',
  openGraph: {
    title: 'SetSelect – Energy & Commodities Talent Pool Bulgaria',
    description:
      'Browse pre-screened energy & commodities talent in Bulgaria. Find and connect with top professionals within just a few clicks.',
    url: 'https://setselect.io/bg',
    siteName: 'SetSelect',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SetSelect – Energy & Commodities Talent Pool Bulgaria',
    description:
      'Browse pre-screened energy & commodities talent in Bulgaria. Find and connect with top professionals within just a few clicks.',
  },
  alternates: {
    canonical: 'https://setselect.io/bg',
    languages: { 'en-CH': 'https://setselect.io', 'en-BG': 'https://setselect.io/bg' },
  },
};

export default function BulgariaHomePage() {
  if (!MARKET_FLAGS.bulgaria) return notFound();
  return <HomeContent market="BG" />;
}
