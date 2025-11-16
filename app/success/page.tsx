import Link from 'next/link';
import Button from '@/components/ui/Button';
import { CheckCircleIcon } from '@/components/ui/icons/CheckCircleIcon';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-[var(--light)] rounded-xl shadow-lg p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            Thank You for Joining Silvia's List!
          </h1>

          {/* Success Message */}
          <p className="text-lg text-gray-700 mb-6">
            Your profile has been successfully submitted to our talent pool.
          </p>

          {/* What Happens Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-200 text-blue-900 font-semibold text-sm mr-3">
                  1
                </span>
                <span>
                  <strong>Check Your Inbox:</strong> You'll receive a confirmation email shortly.
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-200 text-blue-900 font-semibold text-sm mr-3">
                  2
                </span>
                <span>
                  <strong>Profile Review:</strong> Our team will review your complete profile and match you with relevant opportunities.
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-200 text-blue-900 font-semibold text-sm mr-3">
                  3
                </span>
                <span>
                  <strong>We'll Contact You:</strong> When we find a match that fits your preferences, we'll reach out via email with more details.
                </span>
              </li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-600 space-y-2 mb-8">
            <p>
              <strong>Questions or updates?</strong> Feel free to reach out to us at{' '}
              <a href="mailto:contact@silviaslist.com" className="text-primary hover:text-primary-dark underline">
                contact@silviaslist.com
              </a>
            </p>
            <p>
              We're committed to finding you the perfect opportunity that matches your skills and preferences.
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
              <Button variant="primary" size="lg">
                Contact Us
              </Button>
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Your privacy is important to us. All data is handled according to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary-dark underline">
            Terms & Conditions
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
