-- Add favorite/shortlist capability to recruiter_candidates
ALTER TABLE recruiter_candidates
  ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false;

-- Partial index: only index favorited rows for fast filtering
CREATE INDEX idx_recruiter_candidates_favorite
  ON recruiter_candidates(is_favorite) WHERE is_favorite = true;
