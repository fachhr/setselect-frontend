'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { COMPANY } from '@/lib/legal/constants';

const ImpressumPage: React.FC = () => {
  const router = useRouter();

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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--secondary)] to-[var(--highlight)]">Impressum</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">
              Legal notice as required by Swiss law
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-8 md:p-12">
          <div className="space-y-8 text-[var(--text-secondary)] leading-relaxed">

            {/* Company Information */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Company Information</h2>
              <div className="p-6 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{COMPANY.legalName}</p>
                <p className="text-[var(--text-tertiary)]">trading as <strong className="text-[var(--text-primary)]">{COMPANY.tradingAs}</strong></p>
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Registered Address</h2>
              <div className="p-6 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                <p className="text-[var(--text-primary)]">{COMPANY.address.street}</p>
                <p className="text-[var(--text-primary)]">{COMPANY.address.postalCode} {COMPANY.address.city}</p>
                <p className="text-[var(--text-primary)]">{COMPANY.address.country}</p>
              </div>
            </section>

            {/* Recruitment License */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recruitment License</h2>
              <div className="p-6 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)] space-y-3">
                <div>
                  <p className="text-sm text-[var(--text-tertiary)]">Cantonal License (Arbeitsvermittlungsbewilligung)</p>
                  <p className="text-[var(--text-primary)]">{COMPANY.licenses.cantonal}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-tertiary)]">Federal License (SECO)</p>
                  <p className="text-[var(--text-primary)]">{COMPANY.licenses.seco}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-tertiary)] mt-3">
                Licensed for job placement (Arbeitsvermittlung), job coaching, and career consulting under the Swiss Employment Services Act (AVG/AVV).
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Contact</h2>
              <div className="p-6 bg-[var(--bg-surface-2)] rounded-lg border border-[var(--border-subtle)]">
                <p>
                  <a href={`mailto:${COMPANY.contacts.support}`} className="text-[var(--text-primary)] underline hover:text-[var(--gold)]">
                    {COMPANY.contacts.support}
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpressumPage;
