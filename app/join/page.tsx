import Link from 'next/link';
import { TalentPoolForm } from '@/components/TalentPoolForm';
import { ArrowLeft } from 'lucide-react'; // Make sure to install lucide-react

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Simple Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Join the List
          </h1>
          <p className="text-lg text-slate-600">
            Create your profile. We&apos;ll anonymize your data and showcase your skills to top Swiss companies.
          </p>
        </header>

        {/* Main Form */}
        <main>
          <TalentPoolForm />
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-400 border-t border-slate-100 pt-8">
          <p>&copy; {new Date().getFullYear()} Silvia&apos;s List. All rights reserved.</p>
          <p className="mt-2 space-x-4">
            <Link href="/terms" className="hover:text-slate-900 underline decoration-slate-200">Terms & Conditions</Link>
            <a href="mailto:contact@silviaslist.com" className="hover:text-slate-900 underline decoration-slate-200">Contact</a>
          </p>
        </footer>
      </div>
    </div>
  );
}