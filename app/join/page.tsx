import Link from 'next/link';
import { TalentPoolForm } from '@/components/TalentPoolForm';

export default function JoinPage() {
  return (
    <div className="min-h-screen pt-28 sm:pt-32 py-8 px-4 sm:px-6 lg:px-8" style={{
      background: 'var(--background-gradient)',
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Join Silvia's List
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Connect with top opportunities in Switzerland. Upload your CV and join our exclusive talent pool.
          </p>
        </header>

        {/* Main Form */}
        <main>
          <TalentPoolForm />
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-[var(--text-tertiary)]">
          <p>&copy; {new Date().getFullYear()} Silvia's List. All rights reserved.</p>
          <p className="mt-2">
            <Link href="/terms" className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] underline">Terms & Conditions</Link>
            {' • '}
            <a href="mailto:contact@silviaslist.com" className="text-[var(--accent-gold)] hover:text-[var(--accent-gold-hover)] underline">Contact</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
