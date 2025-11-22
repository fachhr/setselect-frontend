'use client';

import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState } from 'react';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[var(--bg-root)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[var(--gold)] rounded flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <span className="text-[#0A1628] font-bold text-lg font-serif">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Silvia&apos;s <span className="font-light text-[var(--text-tertiary)]">List</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/companies"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              For Companies
            </Link>
            <Link
              href="/join"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              For Talent
            </Link>
            <div className="h-4 w-px bg-[var(--border-strong)]"></div>
            <Button variant="primary" icon={ArrowRight} href="/join">
              Join the List
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[var(--bg-root)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] p-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 z-50">
          <Link
            href="/companies"
            className="block w-full text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            For Companies
          </Link>
          <Link
            href="/join"
            className="block w-full text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            For Talent
          </Link>
          <Button className="w-full" href="/join" onClick={() => setIsMobileMenuOpen(false)}>
            Join the List
          </Button>
        </div>
      )}
    </nav>
  );
}
