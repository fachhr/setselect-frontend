-- Add last_activity_at for efficient staleness queries
-- Updated on every note addition, status change, or submission event
ALTER TABLE recruiter_candidates
  ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT now();

-- Backfill from existing data: use the most recent of status_changed_at,
-- the newest note created_at, or created_at as fallback
UPDATE recruiter_candidates
SET last_activity_at = GREATEST(
  status_changed_at,
  created_at,
  COALESCE(
    (SELECT MAX((elem->>'created_at')::timestamptz)
     FROM jsonb_array_elements(notes) AS elem
     WHERE elem->>'created_at' IS NOT NULL),
    created_at
  )
);

-- Index for stale candidate queries (WHERE last_activity_at < now() - interval '5 days')
CREATE INDEX idx_recruiter_candidates_last_activity
  ON recruiter_candidates(last_activity_at);
