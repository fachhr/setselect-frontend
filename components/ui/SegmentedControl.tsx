'use client';

import { type ReactNode } from 'react';

interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-0.5 bg-[var(--bg-surface-2)] rounded-lg p-0.5">
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium rounded-md cursor-pointer whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-[var(--bg-surface-3)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'
            }`}
          >
            {opt.icon}
            {opt.label}
            {opt.count != null && (
              <span className={`text-[10px] px-1.5 py-px rounded-lg ${
                isActive
                  ? 'bg-[var(--border-hover)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-surface-3)] text-[var(--text-tertiary)]'
              }`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
