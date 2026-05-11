import HomeContent from '@/components/home/HomeContent';
import { talentPoolMetadata } from '@/lib/markets/metadata';

export const metadata = talentPoolMetadata('CH');

export default function HomePage() {
  return <HomeContent />;
}
