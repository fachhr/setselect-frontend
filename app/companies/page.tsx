import { Metadata } from 'next';
import CompaniesPage from './CompaniesPage';

export const metadata: Metadata = {
  title: 'Hire Commodities & Energy Talent | SetSelect',
  description: 'Access a curated list of pre-vetted commodities & energy professionals in Switzerland.',
};

export default function CompaniesRoute() {
  return <CompaniesPage />;
}
