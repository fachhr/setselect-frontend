'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">
        Something went wrong
      </h1>
      <p className="text-[var(--text-secondary)] mt-3 max-w-md">
        An unexpected error occurred. Please try again or contact us if the problem persists.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-hover)] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
