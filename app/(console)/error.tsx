'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Console error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <div className="w-12 h-12 rounded-full bg-[var(--error-dim)] flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-[var(--error)]" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Something went wrong
      </h2>
      <p className="text-sm text-[var(--text-muted)] max-w-md">
        An unexpected error occurred. This has been logged. Try refreshing — if the issue persists, contact support.
      </p>
      <button
        onClick={reset}
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity cursor-pointer"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  );
}
