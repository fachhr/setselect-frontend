'use client';

import { useRouter } from 'next/navigation';
import ContactPage from './ContactPage';

export default function ContactRoute() {
  const router = useRouter();

  return <ContactPage onBack={() => router.back()} />;
}
