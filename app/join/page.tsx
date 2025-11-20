'use client';

import { useRouter } from 'next/navigation';
import JoinForm from './JoinForm';

export default function JoinPage() {
  const router = useRouter();

  return (
    <JoinForm
      onBack={() => router.push('/')}
      onTermsClick={() => window.open('/terms', '_blank')}
    />
  );
}