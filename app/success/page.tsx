import Link from 'next/link';
import Button from '@/components/ui/Button';
import { CheckCircleIcon } from '@/components/ui/icons/CheckCircleIcon';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{
      background: 'var(--background-gradient)',
    }}>
      <div className="max-w-2xl w-full">
        <div className="bg-[var(--light)] rounded-xl shadow-lg p-8 sm:p-12 text-center">
          {/* Success Icon - GOLD CELEBRATION */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-[var(--success-bg)] p-4">
              <CheckCircleIcon className="h-16 w-16 text-[var(--success-color)]" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Thank You for Joining Silvia&apos;s List!
          </h1>

          {/* Success Message */}
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            Your profile has been successfully submitted to our talent pool.
          </p>

          {/* What Happens Next */}
          <div className="bg-[var(--info-bg)] border border-[var(--info-color)] rounded-lg p-6 text-left mb-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-[var(--text-secondary)]">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-[var(--accent-gold-alpha)] text-[var(--accent-gold)] font-semibold text-sm mr-3">
                  1
                </span>
                <span>
                  <strong className="text-[var(--text-primary)]">Check Your Inbox:</strong> You&apos;ll receive a confirmation email shortly.
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-[var(--accent-gold-alpha)] text-[var(--accent-gold)] font-semibold text-sm mr-3">
                  2
                </span>
                <span>
                  <strong className="text-[var(--text-primary)]">Profile Review:</strong> Our team will review your complete profile and match you with relevant opportunities.
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-[var(--accent-gold-alpha)] text-[var(--accent-gold)] font-semibold text-sm mr-3">
                  3
                </span>
                <span>
                  <strong className="text-[var(--text-primary)]">We&apos;ll Contact You:</strong> When we find a match that fits your preferences, we&apos;ll reach out via email with more details.
                </span>
              </li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-[var(--text-secondary)] space-y-2 mb-8">
            <p>
              <strong className="text-[var(--text-primary)]">Questions or updates?</strong> Feel free to reach out to us at{' '}
              <a href="mailto:contact@silviaslist.com" className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] underline">
                contact@silviaslist.com
              </a>
            </p>
            <p>
              We&apos;re committed to finding you the perfect opportunity that matches your skills and preferences.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                ← Back to Home
              </Button>
            </Link>
            <a href="mailto:contact@silviaslist.com">
              <Button variant="gold" size="lg">
                Contact Us
              </Button>
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-[var(--text-tertiary)] mt-8">
          Your privacy is important to us. All data is handled according to our{' '}
          <Link href="/terms" className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] underline">
            Terms & Conditions
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
