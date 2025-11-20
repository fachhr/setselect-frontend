import { Metadata } from 'next';
import CompaniesPage from './CompaniesPage';

export const metadata: Metadata = {
  title: 'Hire Top Tech Talent | Silvia\'s List',
  description: 'Access a curated list of pre-vetted engineers and developers in Switzerland.',
};

export default function CompaniesRoute() {
  return <CompaniesPage />;
}
