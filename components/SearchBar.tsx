'use client';

import { Search } from 'lucide-react';
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
}

export function SearchBar({ search, onSearchChange, status, onStatusChange }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-base w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
        />
      </div>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as RecruiterStatus | '')}
        className="input-base px-3 py-2.5 rounded-lg text-sm min-w-[160px] cursor-pointer"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
