-- Company shortlists for persisting favorited candidates
CREATE TABLE company_shortlists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
    talent_id       TEXT NOT NULL,  -- REF-NNN format
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, talent_id)
);

-- Index for fast lookup by company
CREATE INDEX idx_company_shortlists_company_id ON company_shortlists(company_id);

-- RLS: service_role only
ALTER TABLE company_shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_shortlists FORCE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to company_shortlists"
  ON company_shortlists
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
