'use client';

import { Search, ChevronDown, AlertTriangle, Star } from 'lucide-react';
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
}: SearchBarProps) {
  return (
    /*
     * "contents" makes this div invisible to layout on mobile,
     * so children flow into the parent flex-wrap alongside ViewToggle.
     * On sm+, it becomes a normal flex container.
     */
    <div className="contents sm:flex sm:flex-wrap sm:items-center sm:gap-2">
      {/* All / Shortlisted toggle */}
      {onToggleFavoritesFilter && (
        <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-surface-2)', borderRadius: '6px', padding: '3px' }}>
          <button
            onClick={favoritesOnly ? onToggleFavoritesFilter : undefined}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 500,
              borderRadius: '4px',
              cursor: 'pointer',
              border: 'none',
              background: !favoritesOnly ? 'var(--bg-surface-3)' : 'transparent',
              color: !favoritesOnly ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            All <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '2px' }}>({totalCount})</span>
          </button>
          <button
            onClick={!favoritesOnly ? onToggleFavoritesFilter : undefined}
            className="flex items-center gap-1"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 500,
              borderRadius: '4px',
              cursor: 'pointer',
              border: 'none',
              background: favoritesOnly ? 'var(--bg-surface-3)' : 'transparent',
              color: favoritesOnly ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            <Star size={10} fill="currentColor" />
            <span className="hidden sm:inline">Shortlisted</span>
            <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '2px' }}>({shortlistCount})</span>
          </button>
        </div>
      )}

      {/* Search — full width row on mobile, inline on desktop */}
      <div className="relative w-full sm:w-[200px] order-last sm:order-none">
        <Search
          size={14}
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
        />
        <input
          type="text"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-[200px]"
          style={{
            padding: '6px 12px 6px 30px',
            fontSize: '11px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
      </div>

      {/* Status filter */}
      <div style={{ position: 'relative' }}>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as RecruiterStatus | '')}
          style={{
            appearance: 'none',
            padding: '6px 28px 6px 12px',
            fontSize: '11px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown
          size={12}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }}
        />
      </div>

      {/* Stale Only */}
      {onToggleStaleFilter && (
        <button
          onClick={onToggleStaleFilter}
          className="flex items-center gap-1.5"
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 500,
            borderRadius: '6px',
            cursor: 'pointer',
            border: `1px solid ${staleOnly ? 'var(--error-border)' : 'var(--border-strong)'}`,
            background: staleOnly ? 'var(--error-dim)' : 'var(--bg-surface-2)',
            color: staleOnly ? 'var(--error)' : 'var(--text-tertiary)',
          }}
        >
          <AlertTriangle size={12} />
          <span className="hidden sm:inline">Stale Only</span>
        </button>
      )}
    </div>
  );
}
