'use client';

import { useRouter } from 'next/navigation';
import TermsPage from './TermsPage';

export default function TermsRoute() {
  const router = useRouter();

  return <TermsPage onBack={() => router.back()} />;
}
