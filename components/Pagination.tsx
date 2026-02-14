'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  showing?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, showing, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const displayShowing = showing ?? total;

  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <span className="text-xs text-[var(--text-muted)]">
        Showing {displayShowing} of {total} candidates
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 border border-[var(--border-strong)] rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 border border-[var(--border-strong)] rounded text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
