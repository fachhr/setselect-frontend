'use client';

import { Menu } from 'lucide-react';

interface TopBarProps {
  title: string;
  onMenuToggle: () => void;
}

export function TopBar({ title, onMenuToggle }: TopBarProps) {
  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-1)] flex items-center px-6 gap-4">
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        <Menu size={22} />
      </button>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
    </header>
  );
}
