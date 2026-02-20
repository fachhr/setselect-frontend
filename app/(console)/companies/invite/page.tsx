'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InviteCompanyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/companies');
  }, [router]);

  return null;
}
