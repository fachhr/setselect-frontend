import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SetSelect — Access Your Talent Pool',
  description: 'You\'ve been invited to access the SetSelect talent pool. Click to sign in securely.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'SetSelect — Access Your Talent Pool',
    description: 'You\'ve been invited to browse top energy & commodities talent. Click to sign in.',
    siteName: 'SetSelect',
    type: 'website',
  },
};

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
