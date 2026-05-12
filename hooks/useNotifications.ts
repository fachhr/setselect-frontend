'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Mirrors the denormalized columns the scraper writes into job_notifications.
// All payload fields the popover needs come on the realtime INSERT event so
// we can render without a follow-up fetch.
export interface JobNotification {
  id: string;
  listing_id: string;
  source_id: string;
  event_type: 'new_job' | 'removed_job' | 'updated_job' | 'candidate_match';
  title: string;
  company_name: string;
  url: string;
  location: string | null;
  seniority: string | null;
  date_posted: string | null;
  created_at: string;
  read_at: string | null;
}

const RECENT_LIMIT = 50;

export function useNotifications(enabled = true) {
  const [items, setItems] = useState<JobNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  // We capture the supabase client in a ref so the realtime callback closes
  // over a stable instance even though the hook re-runs on dep changes.
  const supabaseRef = useRef(typeof window !== 'undefined' ? createSupabaseBrowserClient() : null);

  const refetch = useCallback(async () => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    const { data, error } = await supabase
      .from('job_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT);
    if (error) {
      console.error('[notifications] fetch failed:', error.message);
      return;
    }
    setItems((data ?? []) as JobNotification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const supabase = supabaseRef.current;
    if (!supabase) return;

    refetch();

    const channel = supabase
      .channel('job_notifications:topbar')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'job_notifications' },
        (payload) => {
          const row = payload.new as JobNotification;
          // Prepend; cap state at RECENT_LIMIT to avoid unbounded growth on
          // long-lived sessions.
          setItems((prev) => {
            if (prev.some((p) => p.id === row.id)) return prev;
            return [row, ...prev].slice(0, RECENT_LIMIT);
          });
        },
      )
      .subscribe((status) => {
        // On every (re-)subscribe, re-fetch state so we don't miss inserts
        // that fired during a transport-level reconnect window. Supabase JS
        // handles the websocket reconnect natively.
        if (status === 'SUBSCRIBED') refetch();
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, refetch]);

  const markRead = useCallback(async (id: string) => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    const now = new Date().toISOString();
    // Optimistic: flip locally, revert on error.
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: now } : n)));
    const { error } = await supabase
      .from('job_notifications')
      .update({ read_at: now })
      .eq('id', id);
    if (error) {
      console.error('[notifications] markRead failed:', error.message);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: null } : n)));
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    const now = new Date().toISOString();
    const previouslyUnreadIds = items.filter((n) => !n.read_at).map((n) => n.id);
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    if (previouslyUnreadIds.length === 0) return;
    const { error } = await supabase
      .from('job_notifications')
      .update({ read_at: now })
      .in('id', previouslyUnreadIds);
    if (error) {
      console.error('[notifications] markAllRead failed:', error.message);
      // Best-effort revert: only the rows we attempted to update.
      const ids = new Set(previouslyUnreadIds);
      setItems((prev) => prev.map((n) => (ids.has(n.id) ? { ...n, read_at: null } : n)));
    }
  }, [items]);

  const unreadCount = items.reduce((n, x) => n + (x.read_at ? 0 : 1), 0);

  return { items, unreadCount, loading, markRead, markAllRead };
}
