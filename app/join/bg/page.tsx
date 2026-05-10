import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JoinForm from '../JoinForm';
import { MARKET_FLAGS } from '@/lib/featureFlags';

export const metadata: Metadata = {
  title: 'Join the Talent Pool | SetSelect Bulgaria',
  description: 'Create your profile and connect with top energy & commodities opportunities in Bulgaria.',
};

export default function JoinBulgariaRoute() {
  if (!MARKET_FLAGS.bulgaria) return notFound();
  return <JoinForm market="BG" />;
}
