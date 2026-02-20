'use client';

import { useState, useEffect, useCallback } from 'react';

export function useShortlists(enabled = true) {
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    async function fetchShortlists() {
      try {
        const res = await fetch('/api/shortlists');
        if (!res.ok) return;
        const data = await res.json();
        setShortlistedIds(data.shortlists?.map((s: { talent_id: string }) => s.talent_id) || []);
      } catch {
        // Silently fail — shortlists are not critical
      } finally {
        setIsLoading(false);
      }
    }
    fetchShortlists();
  }, [enabled]);

  const toggleShortlist = useCallback(async (talentId: string) => {
    const isCurrentlyShortlisted = shortlistedIds.includes(talentId);

    // Optimistic update
    setShortlistedIds((prev) =>
      isCurrentlyShortlisted
        ? prev.filter((id) => id !== talentId)
        : [...prev, talentId]
    );

    try {
      const res = await fetch('/api/shortlists', {
        method: isCurrentlyShortlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talentId }),
      });

      if (!res.ok) {
        // Rollback on error
        setShortlistedIds((prev) =>
          isCurrentlyShortlisted
            ? [...prev, talentId]
            : prev.filter((id) => id !== talentId)
        );
      }
    } catch {
      // Rollback on error
      setShortlistedIds((prev) =>
        isCurrentlyShortlisted
          ? [...prev, talentId]
          : prev.filter((id) => id !== talentId)
      );
    }
  }, [shortlistedIds]);

  return {
    shortlistedIds,
    isShortlisted: useCallback((id: string) => shortlistedIds.includes(id), [shortlistedIds]),
    toggleShortlist,
    isLoading,
  };
}
