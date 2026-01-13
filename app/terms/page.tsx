import { Metadata } from 'next';
import TermsPage from './TermsPage';

export const metadata: Metadata = {
  title: 'Terms of Service | SetSelect',
  description: 'Legal agreements and terms of service for SetSelect.',
};

export default function TermsRoute() {
  return <TermsPage />;
}
