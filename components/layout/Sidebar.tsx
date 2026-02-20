'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, X, Layers, ChevronsLeft, ChevronsRight, UserPlus } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/candidates', label: 'Candidates', icon: Users },
  { href: '/companies/invite', label: 'Invite Company', icon: UserPlus },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-[var(--bg-root)]/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-[var(--bg-surface-1)] border-r border-[var(--border-subtle)] z-50 flex flex-col overflow-hidden transition-all duration-200 lg:translate-x-0 ${
          collapsed ? 'lg:w-16' : 'lg:w-64'
        } w-64 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-8 border-b border-[var(--border-subtle)] transition-all duration-200 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center transition-all duration-200 ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-md shrink-0">
              <Layers className="w-5 h-5 text-[var(--bg-root)]" strokeWidth={2.5} />
            </div>
            <h1 className={`font-[family-name:var(--font-title)] font-bold text-lg tracking-tight text-[var(--text-primary)] overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
              Set<span className="font-light text-[var(--text-secondary)]">Select</span>
              <span className="font-light text-[var(--text-muted)] ml-1">Recruiter</span>
            </h1>
          </div>
          {!collapsed && (
            <button
              onClick={onClose}
              className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 p-4 space-y-1 transition-all duration-200 ${collapsed ? 'px-2' : ''}`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden ${
                  collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-[var(--secondary-dim)] text-[var(--secondary)] border border-[var(--border-subtle)]'
                    : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] border border-transparent'
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className={`hidden lg:flex border-t border-[var(--border-subtle)] transition-all duration-200 ${collapsed ? 'px-2 py-2 justify-center' : 'px-4 py-2'}`}>
          <button
            onClick={onToggleCollapse}
            className={`flex items-center rounded-lg text-sm text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer ${
              collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 w-full'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>Collapse</span>
          </button>
        </div>

        {/* Sign out */}
        <div className={`border-t border-[var(--border-subtle)] transition-all duration-200 ${collapsed ? 'px-2 py-4' : 'p-4'}`}>
          <button
            onClick={handleSignOut}
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex items-center rounded-lg text-sm text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--error)] transition-all duration-200 w-full cursor-pointer ${
              collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
