import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-title font-bold text-[var(--text-primary)]">404</h1>
      <p className="text-[var(--text-secondary)] mt-3 max-w-md">
        This page doesn&apos;t exist. It may have been moved or the URL might be incorrect.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
