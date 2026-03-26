'use client';

import { Search, ChevronDown, Plus, Heart, Users } from 'lucide-react';
import type { RecruiterStatus } from '@/types/recruiter';

const statusOptions: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'placed', label: 'Placed' },
  { value: 'rejected', label: 'Rejected' },
];

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: RecruiterStatus | '';
  onStatusChange: (value: RecruiterStatus | '') => void;
  onAddCandidate?: () => void;
  favoritesOnly?: boolean;
  onToggleFavoritesFilter?: () => void;
  shortlistCount?: number;
  totalCount?: number;
}

export function SearchBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onAddCandidate,
  favoritesOnly = false,
  onToggleFavoritesFilter,
  shortlistCount = 0,
  totalCount = 0,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
        {/* View toggle: All Candidates / Shortlisted */}
        {onToggleFavoritesFilter && (
          <div className="flex rounded-lg border border-[var(--border-strong)] overflow-hidden shrink-0">
            <button
              onClick={favoritesOnly ? onToggleFavoritesFilter : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                !favoritesOnly
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-3)]'
              }`}
              aria-label="Show all candidates"
            >
              <Users size={14} />
              <span className="hidden sm:inline">All</span>
              <span className="tabular-nums text-[11px] opacity-80">({totalCount})</span>
            </button>
            <button
              onClick={!favoritesOnly ? onToggleFavoritesFilter : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer border-l border-[var(--border-strong)] ${
                favoritesOnly
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-3)]'
              }`}
              aria-label="Show shortlisted candidates only"
            >
              <Heart size={13} fill={favoritesOnly ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">Shortlisted</span>
              <span className="tabular-nums text-[11px] opacity-80">({shortlistCount})</span>
            </button>
          </div>
        )}

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search by name, email, role, ref ID, phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-base w-full sm:w-80 pl-10 pr-4 py-1.5 sm:py-2 rounded-lg text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as RecruiterStatus | '')}
            className="input-base appearance-none w-full sm:w-auto pl-4 pr-10 py-1.5 sm:py-2 rounded-lg text-sm sm:min-w-[160px] cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
        </div>
      </div>
      {onAddCandidate && (
        <button
          onClick={onAddCandidate}
          className="btn-gold flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap cursor-pointer"
        >
          <Plus size={16} />
          Add Candidate
        </button>
      )}
    </div>
  );
}
