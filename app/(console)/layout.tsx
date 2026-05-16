'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layers, LogOut, Menu, X } from 'lucide-react';
import { ToastContainer } from '@/components/ui/Toast';
import { NotificationBell } from '@/components/NotificationBell';
import { MarketProvider, useMarket } from '@/lib/MarketContext';
import { MARKETS } from '@/lib/markets';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

interface NavTab {
  href: string;
  label: string;
}

const NAV_TABS: NavTab[] = [
  { href: '/', label: 'Command Center' },
  { href: '/candidates', label: 'Talent Pool' },
  { href: '/companies', label: 'Companies' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/settings', label: 'Settings' },
];

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketProvider>
      <ConsoleShell>{children}</ConsoleShell>
    </MarketProvider>
  );
}

function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { market, setMarket } = useMarket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-nested)]">
        <div className="flex items-center justify-between px-6">
          {/* Logo + Nav Tabs */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 py-3 shrink-0">
              <div className="w-7 h-7 bg-[var(--primary)] rounded-md flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-[family-name:var(--font-title)] font-bold text-sm text-[var(--text-primary)] hidden sm:inline">
                Set<span className="font-light text-[var(--text-secondary)]">Select</span>
              </span>
            </Link>

            {/* Desktop Nav Tabs */}
            <nav className="hidden md:flex gap-1">
              {NAV_TABS.map((tab) => {
                const isActive = tab.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`px-5 py-2.5 text-xs font-medium rounded-md transition-colors tracking-[0.3px] ${
                      isActive
                        ? 'text-[var(--text-primary)] bg-[var(--bg-surface-3)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)]'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side: market switcher + notifications + sign out + mobile menu */}
          <div className="flex items-center gap-3">
            <SegmentedControl
              options={MARKETS.map(m => ({ value: m, label: m }))}
              value={market}
              onChange={setMarket}
            />
            <NotificationBell />
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-tertiary)] transition-colors cursor-pointer px-2 py-1.5 rounded-md hover:bg-[var(--bg-surface-2)]"
            >
              <LogOut size={14} />
              <span className="hidden lg:inline">Sign Out</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer p-1"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-[var(--border-subtle)] px-4 py-2 space-y-1">
            {NAV_TABS.map((tab) => {
              const isActive = tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-sm rounded-md ${
                    isActive
                      ? 'text-[var(--text-primary)] bg-[var(--bg-surface-3)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--error-dim)] rounded-md cursor-pointer"
            >
              Sign Out
            </button>
          </nav>
        )}
      </header>

      {/* Main Content — full width */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <ToastContainer />
    </div>
  );
}
