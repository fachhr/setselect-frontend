'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications, type JobNotification } from '@/hooks/useNotifications';

// Lightweight time-ago helper. No new dependency.
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return 'just now';
  const m = Math.floor(diffSec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(iso).toLocaleDateString();
}

function NotificationItem({
  n,
  onMarkRead,
}: {
  n: JobNotification;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = !n.read_at;
  const meta = [n.seniority, n.location].filter(Boolean).join(' · ');
  return (
    <div
      className={`group relative flex flex-col gap-1 px-4 py-3 border-b border-[var(--border-subtle)] transition-colors ${
        isUnread ? 'bg-[var(--bg-surface-2)]' : 'bg-transparent'
      } hover:bg-[var(--bg-surface-3)]`}
    >
      <a
        href={n.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-0.5"
        onClick={() => isUnread && onMarkRead(n.id)}
      >
        <div className="flex items-center gap-2">
          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)] flex-shrink-0" aria-hidden />}
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {n.company_name}
          </span>
        </div>
        <span className="text-sm text-[var(--text-primary)] line-clamp-2">{n.title}</span>
        <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 mt-0.5">
          {meta && <span className="truncate">{meta}</span>}
          {meta && <span aria-hidden>·</span>}
          <span className="flex-shrink-0">{timeAgo(n.created_at)}</span>
        </span>
      </a>
      {isUnread && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead(n.id);
          }}
          aria-label="Mark as read"
          title="Mark as read"
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-surface-3)] transition-opacity text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function NotificationBell() {
  const { items, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click-outside / Escape to close.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const visible = items.slice(0, 20);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        className="relative p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-root)]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--secondary)] text-[var(--bg-root)] text-[10px] font-bold flex items-center justify-center leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Recent job notifications"
          className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-[var(--bg-root)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-lg shadow-2xl overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Notifications{unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                Loading…
              </div>
            ) : visible.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                No new jobs since you last checked.<br />
                <span className="text-xs">Cron polls every hour.</span>
              </div>
            ) : (
              visible.map((n) => (
                <NotificationItem key={n.id} n={n} onMarkRead={markRead} />
              ))
            )}
          </div>

          {items.length > 20 && (
            <div className="px-4 py-2 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-tertiary)]">
              Showing 20 of {items.length} recent
            </div>
          )}
        </div>
      )}
    </div>
  );
}
