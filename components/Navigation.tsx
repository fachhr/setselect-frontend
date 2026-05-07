'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight, Layers, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState } from 'react';
import { useZenMode } from '@/contexts/ZenModeContext';
import { useAuth } from '@/contexts/AuthContext';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isZenMode } = useZenMode();
  const { user, isLoading, signOut } = useAuth();

  // Hide navigation in Zen Mode
  if (isZenMode) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 bg-[var(--bg-root)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-5 h-5 text-[var(--bg-root)]" strokeWidth={2.5} />
            </div>
            <span className="font-title text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Set<span className="font-light text-[var(--text-secondary)]">Select</span>
              <sup className="ml-1 text-[10px] font-light tracking-wide text-[var(--text-secondary)]">beta</sup>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="https://setberry.com/home/"
              className="nav-link flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Image src="/setberry-logo.svg" alt="Setberry" width={10} height={10} className="inline-block" style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(170deg) brightness(1.8)', opacity: 1 }} />
              Setberry
            </a>
            {!isLoading && (user ? (
              <>
                <Link
                  href="/"
                  className="nav-link text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Talent Pool
                </Link>
                <div className="h-4 w-px bg-[var(--border-strong)]"></div>
                <Button variant="outline" icon={LogOut} onClick={signOut}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="nav-link text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Access Talent
                </Link>
                <div className="h-4 w-px bg-[var(--border-strong)]"></div>
                <Button variant="primary" icon={ArrowRight} href="/join">
                  Join the Pool
                </Button>
              </>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface-2)] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[var(--bg-root)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] p-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 z-50">
          <a
            href="https://setberry.com/home/"
            className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Image src="/setberry-logo.svg" alt="Setberry" width={10} height={10} className="inline-block" style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(170deg) brightness(1.8)', opacity: 1 }} />
            Setberry
          </a>
          {!isLoading && (user ? (
            <>
              <Link
                href="/"
                className="block w-full text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Talent Pool
              </Link>
              <div className="border-t border-[var(--border-subtle)] pt-4 mt-2">
                <Button variant="outline" icon={LogOut} className="w-full" onClick={() => { signOut(); setIsMobileMenuOpen(false); }}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="block w-full text-left text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Access Talent
              </Link>
              <Button className="w-full" href="/join" onClick={() => setIsMobileMenuOpen(false)}>
                Join the Pool
              </Button>
            </>
          ))}
        </div>
      )}
    </nav>
  );
}
