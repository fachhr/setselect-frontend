import { Metadata } from 'next';
import HomeContent from '@/components/home/HomeContent';

export const metadata: Metadata = {
  title: "SetSelect - Switzerland's Leading Energy & Commodities Talent Pool",
  description: "Browse pre-screened and selected energy & commodities talent in Switzerland. Find and connect with top professionals within just a few clicks.",
  openGraph: {
    title: "SetSelect - Switzerland's Leading Energy & Commodities Talent Pool",
    description: "Browse pre-screened and selected energy & commodities talent in Switzerland. Find and connect with top professionals within just a few clicks.",
    url: "https://setselect.io",
    siteName: "SetSelect",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SetSelect - Switzerland's Leading Energy & Commodities Talent Pool",
    description: "Browse pre-screened and selected energy & commodities talent in Switzerland. Find and connect with top professionals within just a few clicks.",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
