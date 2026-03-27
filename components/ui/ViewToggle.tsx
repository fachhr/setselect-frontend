'use client';

import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  value: 'board' | 'table';
  onChange: (view: 'board' | 'table') => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-[2px] bg-[var(--bg-surface-2)] rounded-md p-[3px]">
      <button
        onClick={() => onChange('board')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium rounded cursor-pointer transition-colors ${
          value === 'board'
            ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)]'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        }`}
      >
        <LayoutGrid size={12} />
        Board
      </button>
      <button
        onClick={() => onChange('table')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium rounded cursor-pointer transition-colors ${
          value === 'table'
            ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)]'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
        }`}
      >
        <List size={12} />
        Table
      </button>
    </div>
  );
}
