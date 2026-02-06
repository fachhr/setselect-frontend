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
      {/* Mobile layout */}
      <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5 text-[var(--bg-root)]" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-title font-bold tracking-tight text-[var(--text-primary)] text-sm leading-none">Set<span className="font-light text-[var(--text-secondary)]">Select</span></span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Energy & Commodities Recruitment</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[var(--text-primary)] transition-colors">Cookies</Link>
              </li>
              <li>
                <Link href="/impressum" className="hover:text-[var(--text-primary)] transition-colors">Impressum</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-6">
          <div className="text-xs text-[var(--text-tertiary)] font-mono">
            © 2026 SetSelect.
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-[var(--bg-root)]" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-title font-bold tracking-tight text-[var(--text-primary)] text-sm leading-none">Set<span className="font-light text-[var(--text-secondary)]">Select</span></span>
              <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Energy & Commodities Recruitment</span>
            </div>
          </div>
          <div className="text-sm text-[var(--text-secondary)] flex flex-wrap justify-center gap-x-8 gap-y-2">
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="hover:text-[var(--text-primary)] transition-colors">
              Cookies
            </Link>
            <Link href="/impressum" className="hover:text-[var(--text-primary)] transition-colors">
              Impressum
            </Link>
            <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-mono">
            © 2026 SetSelect.
          </div>
        </div>
      </div>
    </footer>
  );
}
