'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { COMPANY } from '@/lib/legal/constants';

const CookiesPage: React.FC = () => {
  const router = useRouter();
  const { consent, acceptCookies, rejectCookies, resetConsent } = useCookieConsent();

  return (
    <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="bg-[var(--bg-root)] border-b border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--secondary)] opacity-[0.08] blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary)] opacity-[0.06] blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>

          <div className="text-center">
            <h1 className="font-title text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
              Cookie <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">Policy</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              How we use cookies and similar technologies
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-8 md:p-12">
          <div className="space-y-10 text-[var(--text-secondary)] leading-relaxed">

            {/* Current Preference */}
            <section className="p-4 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Your Current Preference</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm">
                    Analytics:{' '}
                    <span className={`font-semibold ${consent === 'accepted' ? 'text-green-500' : consent === 'rejected' ? 'text-red-500' : 'text-[var(--text-tertiary)]'}`}>
                      {consent === 'accepted' ? 'Enabled' : consent === 'rejected' ? 'Disabled' : 'Not set'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {consent !== 'pending' && (
                    <button
                      onClick={resetConsent}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-strong)] transition-colors"
                    >
                      Reset
                    </button>
                  )}
                  {consent !== 'accepted' && (
                    <button
                      onClick={acceptCookies}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--bg-root)] bg-[var(--gold)] rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Accept
                    </button>
                  )}
                  {consent !== 'rejected' && (
                    <button
                      onClick={rejectCookies}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-strong)] transition-colors"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Cookies We Use */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Cookies We Use</h2>

              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Essential Cookies</h3>
              <p className="mb-4">
                These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions you take, such as setting your privacy preferences.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left py-2 pr-4 font-semibold text-[var(--text-primary)]">Cookie</th>
                      <th className="text-left py-2 pr-4 font-semibold text-[var(--text-primary)]">Purpose</th>
                      <th className="text-left py-2 font-semibold text-[var(--text-primary)]">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    <tr>
                      <td className="py-3 pr-4 font-mono text-xs">cookie-consent</td>
                      <td className="py-3 pr-4">Stores your cookie consent preference</td>
                      <td className="py-3">Persistent</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-mono text-xs">_grecaptcha</td>
                      <td className="py-3 pr-4">Google reCAPTCHA for form spam prevention</td>
                      <td className="py-3">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </section>

            {/* Analytics */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Analytics</h2>
              <p>
                We use Vercel Analytics to understand how visitors interact with our website. This service is <strong className="text-[var(--text-primary)]">cookieless</strong> — it does not store cookies on your device and does not collect personal identifiers. Data collected includes page views, referrer, and country (anonymised).
              </p>
              <p className="mt-3 text-sm text-[var(--text-tertiary)]">
                Vercel Analytics is only active when you have given consent via the preference panel above.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Third-Party Services</h2>
              <p>
                We use Google reCAPTCHA to protect our forms from spam and abuse. This service may set cookies on your device (classified as essential). For more information, see{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--gold)]">
                  Google&apos;s Privacy Policy
                </a>.
              </p>
            </section>

            <div className="pt-6 border-t border-[var(--border-subtle)] text-sm text-[var(--text-tertiary)]">
              <p>
                For details on how we process personal data, see our{' '}
                <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link>.
              </p>
              <p className="mt-2">
                <strong>Last updated:</strong> {COMPANY.terms.lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
