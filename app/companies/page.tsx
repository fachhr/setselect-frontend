'use client';

import { useRouter } from 'next/navigation';
import CompaniesPage from './CompaniesPage';

export default function CompaniesRoute() {
  const router = useRouter();

  return (
    <CompaniesPage
      onBack={() => router.back()}
      onContactClick={() => router.push('/contact')}
    />
  );
}
