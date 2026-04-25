-- Add target_countries to job_sources for geographic filtering during scraping
ALTER TABLE job_sources
  ADD COLUMN IF NOT EXISTS target_countries TEXT[] NOT NULL DEFAULT '{Switzerland,Bulgaria,United Kingdom}';
