import { Metadata } from 'next';
import PrivacyPage from './PrivacyPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | SetSelect',
  description: 'How SetSelect collects, uses, and protects your personal data. Learn about your rights under Swiss data protection law (revFADP).',
};

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
