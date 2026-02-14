'use client';

import { Search, ChevronDown, Plus } from 'lucide-react';
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
}

export function SearchBar({ search, onSearchChange, status, onStatusChange, onAddCandidate }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-initial">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-base w-full sm:w-80 pl-10 pr-4 py-2 rounded-lg text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as RecruiterStatus | '')}
            className="input-base appearance-none pl-4 pr-10 py-2 rounded-lg text-sm min-w-[160px] cursor-pointer"
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
