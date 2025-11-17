import { Suspense } from 'react';
import TalentPoolContent from '@/components/talent-pool/TalentPoolContent';

/**
 * Home Page - Talent Pool Browser
 *
 * This page wraps TalentPoolContent in a Suspense boundary to satisfy
 * Next.js 15's requirement for dynamic hooks like useSearchParams().
 *
 * The Suspense boundary allows the page to be statically generated while
 * deferring the dynamic search params handling to client-side.
 */

// Loading fallback component matching the design
function TalentPoolLoading() {
  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
      style={{
        background: 'var(--background-gradient)',
      }}
    >
      <div className="text-center">
        <div
          className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          style={{ color: 'var(--accent-gold)' }}
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
          Loading talent pool...
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<TalentPoolLoading />}>
      <TalentPoolContent />
    </Suspense>
  );
}
