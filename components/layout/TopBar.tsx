'use client';

import { Menu, Bell } from 'lucide-react';

interface TopBarProps {
  title: string;
  onMenuToggle: () => void;
}

export function TopBar({ title, onMenuToggle }: TopBarProps) {
  return (
    <header className="h-14 sm:h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-1)]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden relative text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--error)] rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center ring-2 ring-[var(--border-subtle)]">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      </div>
    </header>
  );
}
