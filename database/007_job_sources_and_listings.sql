-- Job sources: career pages being watched
CREATE TABLE IF NOT EXISTS job_sources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name    TEXT NOT NULL,
  career_url      TEXT NOT NULL,
  fetch_mode      TEXT NOT NULL DEFAULT 'auto'
                  CHECK (fetch_mode IN ('auto', 'direct', 'jina')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  target_countries TEXT[] NOT NULL DEFAULT '{Switzerland}',
  last_scraped_at TIMESTAMPTZ,
  last_error      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE(career_url)
);

CREATE INDEX idx_job_sources_active ON job_sources(is_active) WHERE is_active = true;

ALTER TABLE job_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on job_sources"
  ON job_sources FOR ALL TO service_role
  USING (true) WITH CHECK (true);


-- Job listings: individual positions scraped from sources
CREATE TABLE IF NOT EXISTS job_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID NOT NULL REFERENCES job_sources(id) ON DELETE CASCADE,
  external_id     TEXT NOT NULL,
  title           TEXT NOT NULL,
  url             TEXT NOT NULL,
  location        TEXT,
  description     TEXT,
  seniority       TEXT CHECK (seniority IN ('junior', 'mid', 'senior', 'executive', 'c-suite')),
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'evaluating', 'pursuing', 'passed')),
  first_seen_at   TIMESTAMPTZ DEFAULT now(),
  last_seen_at    TIMESTAMPTZ DEFAULT now(),
  removed_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE(source_id, external_id)
);

CREATE INDEX idx_job_listings_status ON job_listings(status);
CREATE INDEX idx_job_listings_source ON job_listings(source_id);
CREATE INDEX idx_job_listings_seniority ON job_listings(seniority);
CREATE INDEX idx_job_listings_first_seen ON job_listings(first_seen_at DESC);
CREATE INDEX idx_job_listings_new_count ON job_listings(status) WHERE status = 'new';

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on job_listings"
  ON job_listings FOR ALL TO service_role
  USING (true) WITH CHECK (true);
