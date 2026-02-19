'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

export function Analytics() {
  const { hasConsent } = useCookieConsent();

  if (!hasConsent) {
    return null;
  }

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
