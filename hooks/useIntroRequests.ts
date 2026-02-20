'use client';

import { useState, useEffect, useCallback } from 'react';

interface IntroRequest {
  id: string;
  talent_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string | null;
  created_at: string;
}

export function useIntroRequests(enabled = true) {
  const [introRequests, setIntroRequests] = useState<IntroRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    async function fetchIntroRequests() {
      try {
        const res = await fetch('/api/intro-requests');
        if (!res.ok) return;
        const data = await res.json();
        setIntroRequests(data.introRequests || []);
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchIntroRequests();
  }, [enabled]);

  const getRequestStatus = useCallback(
    (talentId: string): IntroRequest['status'] | null => {
      const request = introRequests.find(
        (r) => r.talent_id === talentId && r.status !== 'cancelled'
      );
      return request?.status ?? null;
    },
    [introRequests]
  );

  const submitRequest = useCallback(
    async (talentId: string, message?: string): Promise<boolean> => {
      // Optimistic update
      const tempRequest: IntroRequest = {
        id: `temp-${Date.now()}`,
        talent_id: talentId,
        status: 'pending',
        message: message || null,
        created_at: new Date().toISOString(),
      };
      setIntroRequests((prev) => [tempRequest, ...prev]);

      try {
        const res = await fetch('/api/intro-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ talentId, message }),
        });

        if (!res.ok) {
          // Rollback
          setIntroRequests((prev) => prev.filter((r) => r.id !== tempRequest.id));
          return false;
        }

        return true;
      } catch {
        setIntroRequests((prev) => prev.filter((r) => r.id !== tempRequest.id));
        return false;
      }
    },
    []
  );

  const cancelRequest = useCallback(
    async (talentId: string): Promise<boolean> => {
      const original = introRequests.find(
        (r) => r.talent_id === talentId && r.status === 'pending'
      );
      if (!original) return false;

      // Optimistic update
      setIntroRequests((prev) =>
        prev.map((r) =>
          r.id === original.id ? { ...r, status: 'cancelled' as const } : r
        )
      );

      try {
        const res = await fetch('/api/intro-requests', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ talentId }),
        });

        if (!res.ok) {
          // Rollback
          setIntroRequests((prev) =>
            prev.map((r) =>
              r.id === original.id ? original : r
            )
          );
          return false;
        }

        return true;
      } catch {
        setIntroRequests((prev) =>
          prev.map((r) =>
            r.id === original.id ? original : r
          )
        );
        return false;
      }
    },
    [introRequests]
  );

  return {
    introRequests,
    getRequestStatus,
    submitRequest,
    cancelRequest,
    isLoading,
  };
}
