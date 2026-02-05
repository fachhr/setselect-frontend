'use client';

import Link from 'next/link';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

export function CookieBanner() {
  const { consent, acceptCookies, rejectCookies } = useCookieConsent();

  if (consent !== 'pending') {
    return null;
  }

  return (
    <>
      {/* Upward blur gradient overlay */}
      <div
        className="fixed bottom-0 left-0 right-0 h-72 pointer-events-none z-[79] bg-[var(--bg-root)]/90 backdrop-blur-sm animate-in fade-in duration-700 [mask-image:linear-gradient(to_top,black_0%,black_30%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Cookie banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-surface-1)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] p-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)] z-[80] animate-in slide-in-from-bottom-4 fade-in duration-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--text-secondary)] text-center sm:text-left leading-relaxed">
            We use analytics to understand how visitors use our website and improve your experience.{' '}
            <Link
              href="/cookies"
              className="font-medium underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--primary)] hover:decoration-[var(--primary)] transition-all"
            >
              Learn more
            </Link>
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={rejectCookies}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-surface-1)] hover:border-[var(--border-strong)] transition-colors"
            >
              Reject
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-[var(--bg-root)] bg-[var(--primary)] rounded-lg hover:opacity-90 transition-opacity"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
