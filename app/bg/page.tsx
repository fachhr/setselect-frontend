import { notFound } from 'next/navigation';
import HomeContent from '@/components/home/HomeContent';
import { MARKET_FLAGS } from '@/lib/featureFlags';
import { talentPoolMetadata } from '@/lib/markets/metadata';

export const metadata = talentPoolMetadata('BG');

export default function BulgariaHomePage() {
  if (!MARKET_FLAGS.bulgaria) return notFound();
  return <HomeContent market="BG" />;
}
