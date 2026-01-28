'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

export function Analytics() {
  const { hasConsent } = useCookieConsent();

  // Only render analytics if user has consented
  if (!hasConsent) {
    return null;
  }

  return <VercelAnalytics />;
}
