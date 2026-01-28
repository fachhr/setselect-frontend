import { Metadata } from 'next';
import ImpressumPage from './ImpressumPage';

export const metadata: Metadata = {
  title: 'Impressum | SetSelect',
  description: 'Legal notice and company information for SetSelect, operated by Setberry Filipova.',
};

export default function ImpressumRoute() {
  return <ImpressumPage />;
}
