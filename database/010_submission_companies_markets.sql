-- Add markets array to submission_companies (mirrors job_sources.target_countries pattern)
ALTER TABLE submission_companies
  ADD COLUMN IF NOT EXISTS markets TEXT[] NOT NULL DEFAULT '{CH,BG}';

-- Backfill existing rows
UPDATE submission_companies SET markets = '{CH,BG}' WHERE markets = '{}';

-- GIN index for @> (contains) queries
CREATE INDEX IF NOT EXISTS idx_submission_companies_markets
  ON submission_companies USING GIN (markets);
