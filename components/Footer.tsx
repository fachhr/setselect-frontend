'use client';

import Link from 'next/link';
import { Layers } from 'lucide-react';
import { useZenMode } from '@/contexts/ZenModeContext';

export function Footer() {
  const { isZenMode } = useZenMode();

  // Hide footer in Zen Mode
  if (isZenMode) {
    return null;
  }

  return (
    <footer className="bg-[var(--bg-root)] border-t border-[var(--border-subtle)] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-[var(--bg-root)]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[var(--text-primary)] text-sm leading-none">SetSelect</span>
              <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Tech Recruitment Switzerland</span>
            </div>
          </div>
          <div className="text-sm text-[var(--text-secondary)] flex gap-8">
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-mono">
            © 2025 SetSelect.
          </div>
        </div>
      </div>
    </footer>
  );
}
