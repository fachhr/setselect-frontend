import { notFound } from 'next/navigation';
import JoinForm from '../JoinForm';
import { MARKET_FLAGS } from '@/lib/featureFlags';
import { joinPageMetadata } from '@/lib/markets/metadata';

export const metadata = joinPageMetadata('BG');

export default function JoinBulgariaRoute() {
  if (!MARKET_FLAGS.bulgaria) return notFound();
  return <JoinForm market="BG" />;
}
