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
                    Analytics cookies:{' '}
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

            {/* What Are Cookies */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, such as your preferences, which can make your next visit easier and the site more useful to you.
              </p>
            </section>

            {/* How We Use Cookies */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">How We Use Cookies</h2>
              <p>We use a minimal set of cookies, categorised as follows:</p>

              <h3 className="font-semibold text-[var(--text-primary)] mt-6 mb-3">Essential Cookies</h3>
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

              <h3 className="font-semibold text-[var(--text-primary)] mt-6 mb-3">Analytics Cookies (Optional)</h3>
              <p className="mb-4">
                These cookies help us understand how visitors interact with our website. They are only enabled if you give consent.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left py-2 pr-4 font-semibold text-[var(--text-primary)]">Service</th>
                      <th className="text-left py-2 pr-4 font-semibold text-[var(--text-primary)]">Purpose</th>
                      <th className="text-left py-2 font-semibold text-[var(--text-primary)]">Data Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="py-3 pr-4 font-medium">Vercel Analytics</td>
                      <td className="py-3 pr-4">Website usage analytics</td>
                      <td className="py-3">Page views, referrer, country (anonymised)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-[var(--text-tertiary)]">
                Vercel Analytics is a privacy-friendly analytics solution that does not use cookies for tracking and does not collect personal identifiers.
              </p>
            </section>

            {/* Managing Cookies */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Managing Your Preferences</h2>
              <p>
                You can manage your cookie preferences at any time using the controls at the top of this page, or through our cookie consent banner when you first visit the site.
              </p>
              <p className="mt-4">
                You can also control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-outside ml-6 space-y-1 mt-2">
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p className="mt-4 text-sm text-[var(--text-tertiary)]">
                Note: Blocking all cookies may affect the functionality of some websites.
              </p>
            </section>

            {/* Third-Party Cookies */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Third-Party Cookies</h2>
              <p>
                We use Google reCAPTCHA to protect our forms from spam and abuse. This service may set cookies on your device. For more information, see{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--gold)]">
                  Google&apos;s Privacy Policy
                </a>.
              </p>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at{' '}
                <a href={`mailto:${COMPANY.contacts.privacy}`} className="underline hover:text-[var(--gold)]">
                  {COMPANY.contacts.privacy}
                </a>.
              </p>
            </section>

            {/* Related Links */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Related Policies</h2>
              <ul className="list-disc list-outside ml-6 space-y-2">
                <li>
                  <Link href="/privacy" className="underline hover:text-[var(--gold)]">Privacy Policy</Link> – How we collect and use your personal data
                </li>
                <li>
                  <Link href="/terms" className="underline hover:text-[var(--gold)]">Terms & Conditions</Link> – Rules for using our platform
                </li>
              </ul>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
              <p className="text-sm text-[var(--text-tertiary)]">
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
