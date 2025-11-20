import { Metadata } from 'next';
import TermsPage from './TermsPage';

export const metadata: Metadata = {
  title: 'Terms of Service | Silvia\'s List',
  description: 'Legal agreements and terms of service for Silvia\'s List.',
};

export default function TermsRoute() {
  return <TermsPage />;
}
