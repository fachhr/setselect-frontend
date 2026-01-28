import { Metadata } from 'next';
import TermsPage from './TermsPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SetSelect',
  description: 'Terms and Conditions for candidates using the SetSelect recruitment platform. Covers data processing, privacy, liability, and your rights under Swiss law.',
};

export default function TermsRoute() {
  return <TermsPage />;
}
