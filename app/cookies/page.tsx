import { Metadata } from 'next';
import CookiesPage from './CookiesPage';

export const metadata: Metadata = {
  title: 'Cookie Policy | SetSelect',
  description: 'Information about how SetSelect uses cookies and similar technologies.',
};

export default function CookiesRoute() {
  return <CookiesPage />;
}
