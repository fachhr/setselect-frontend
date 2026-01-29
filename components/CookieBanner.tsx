'use client';

import Link from 'next/link';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

export function CookieBanner() {
  const { consent, acceptCookies, rejectCookies } = useCookieConsent();

  // Only show banner if consent is pending
  if (consent !== 'pending') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-[var(--text-secondary)]">
                We use analytics to understand how visitors use our website and improve your experience.{' '}
                <Link href="/cookies" className="underline hover:text-[var(--gold)]">
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex gap-3 sm:flex-shrink-0">
              <button
                onClick={rejectCookies}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-surface-1)] hover:border-[var(--border-strong)] transition-colors"
              >
                Reject
              </button>
              <button
                onClick={acceptCookies}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[var(--bg-root)] bg-[var(--gold)] rounded-lg hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
