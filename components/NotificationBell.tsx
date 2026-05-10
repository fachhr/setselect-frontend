'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, ExternalLink } from 'lucide-react';

interface Notification {
  id: string;
  listing_id: string;
  source_id: string;
  event_type: string;
  title: string;
  company_name: string;
  url: string;
  location: string | null;
  seniority: string | null;
  date_posted: string | null;
  created_at: string;
  read_at: string | null;
}

const POLL_MS = 30_000;

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  async function refetch() {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
    } catch {
      // Network blip — leave existing state, next poll retries.
    }
  }

  // Initial fetch + polling cadence.
  useEffect(() => {
    refetch();
    const id = setInterval(refetch, POLL_MS);
    return () => clearInterval(id);
  }, []);

  // Click-outside / Escape closes the popover.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      const t = e.target as Node | null;
      if (
        popoverRef.current && !popoverRef.current.contains(t) &&
        buttonRef.current && !buttonRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    } catch {
      refetch();
    }
  }

  async function markAllRead() {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
    } catch {
      refetch();
    }
  }

  const unreadCount = items.filter((n) => !n.read_at).length;
  const visible = items.slice(0, 20);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-semibold rounded-full bg-[var(--primary)] text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] z-50 bg-[var(--bg-nested)] border border-[var(--border-subtle)] rounded-lg shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <span className="text-[9px] font-semibold uppercase tracking-[1.2px] text-[var(--text-muted)]">
              Notifications
              {unreadCount > 0 && <span className="ml-2 text-[var(--text-muted)] normal-case font-normal">· {unreadCount} unread</span>}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-tertiary)] transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {visible.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                No new jobs since you last checked.
                <br />
                <span className="text-[var(--text-tertiary)]">Cron polls every 6 hours.</span>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {visible.map((n) => (
                  <a
                    key={n.id}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markRead(n.id)}
                    className={`block px-4 py-3 hover:bg-[var(--bg-surface-2)] transition-colors ${
                      !n.read_at ? 'bg-[var(--bg-surface-1)]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read_at && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-[var(--text-primary)]">{n.company_name}</span>
                          <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.title}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-2">
                          {n.seniority && <span>{n.seniority}</span>}
                          {n.location && <span>· {n.location}</span>}
                          <span>· {timeAgo(n.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
