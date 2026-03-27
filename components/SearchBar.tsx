'use client';

import { Search, ChevronDown, AlertTriangle } from 'lucide-react';
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            ★ Shortlisted <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '2px' }}>({shortlistCount})</span>
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search
          size={14}
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
        />
        <input
          type="text"
          placeholder="Search candidates..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '200px',
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            fontSize: '11px',
            fontWeight: 500,
            borderRadius: '6px',
            cursor: 'pointer',
            border: `1px solid ${staleOnly ? 'var(--error-border)' : 'var(--border-strong)'}`,
            background: staleOnly ? 'var(--error-dim)' : 'transparent',
            color: 'var(--error)',
          }}
        >
          <AlertTriangle size={12} />
          Stale Only
        </button>
      )}
    </div>
  );
}
