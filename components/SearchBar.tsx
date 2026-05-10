'use client';

import { Search, ChevronDown, AlertTriangle, Star, SlidersHorizontal } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
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
  staleOnly?: boolean;
  onToggleStaleFilter?: () => void;
  shortlistCount?: number;
  totalCount?: number;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  activeFilterCount?: number;
}

export function SearchBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  favoritesOnly = false,
  onToggleFavoritesFilter,
  staleOnly = false,
  onToggleStaleFilter,
  shortlistCount = 0,
  totalCount = 0,
  filtersOpen = false,
  onToggleFilters,
  activeFilterCount = 0,
}: SearchBarProps) {
  return (
    <div className="contents sm:flex sm:flex-wrap sm:items-center sm:gap-2">
      {onToggleFavoritesFilter && (
        <SegmentedControl
          options={[
            { value: 'all', label: 'All', count: totalCount },
            { value: 'favorites', label: 'Shortlisted', icon: <Star size={10} fill="currentColor" />, count: shortlistCount },
          ]}
          value={favoritesOnly ? 'favorites' : 'all'}
          onChange={() => onToggleFavoritesFilter()}
        />
      )}

      <div className="relative w-full sm:w-[200px] order-last sm:order-none">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
        />
        <input
          type="text"
          placeholder="Search all fields..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-base w-full pl-[30px] pr-3 py-1.5 text-[11px] rounded-md"
        />
      </div>

      <div className="relative">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as RecruiterStatus | '')}
          className="input-base appearance-none pl-3 pr-7 py-1.5 text-[11px] rounded-md cursor-pointer"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
        />
      </div>

      {onToggleStaleFilter && (
        <button
          onClick={onToggleStaleFilter}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md cursor-pointer border transition-colors ${
            staleOnly
              ? 'border-[var(--stale-border)] bg-[var(--stale-dim)] text-[var(--stale)]'
              : 'border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]'
          }`}
        >
          <AlertTriangle size={12} />
          <span className="hidden sm:inline">Stale Only</span>
        </button>
      )}

      {onToggleFilters && (
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md cursor-pointer border transition-colors ${
            filtersOpen
              ? 'border-[var(--secondary)] bg-[var(--secondary-dim)] text-[var(--secondary)]'
              : activeFilterCount > 0
                ? 'border-[var(--secondary)] bg-[var(--secondary-dim)] text-[var(--text-primary)]'
                : 'border-[var(--border-strong)] bg-[var(--bg-surface-2)] text-[var(--text-tertiary)]'
          }`}
        >
          <SlidersHorizontal size={12} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-[var(--secondary)] text-[var(--bg-root)] rounded-full min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold px-1">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
