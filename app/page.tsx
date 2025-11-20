import { Metadata } from 'next';
import HomeContent from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: "Silvia's List - Switzerland's #1 Tech Talent Pool",
  description: 'Discover exceptional tech talent in Zurich, Geneva, and beyond. Connect directly with pre-screened professionals.',
};

export default function HomePage() {
  return <HomeContent />;
}
