import { Metadata } from 'next';
import CompaniesPage from './CompaniesPage';

export const metadata: Metadata = {
  title: 'Hire Energy & Commodities Talent | SetSelect',
  description: 'Access a curated list of pre-vetted energy & commodities professionals in Switzerland.',
};

export default function CompaniesRoute() {
  return <CompaniesPage />;
}
