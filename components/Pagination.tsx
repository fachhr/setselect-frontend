'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-[var(--text-muted)]">
        {total} candidate{total !== 1 ? 's' : ''} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2 py-1.5"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm text-[var(--text-secondary)]">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2 py-1.5"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
