-- Intro requests for companies to request introductions to candidates
CREATE TABLE intro_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
    talent_id       TEXT NOT NULL,  -- REF-NNN format
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    message         TEXT,
    admin_notes     TEXT,
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, talent_id)
);

-- Index for fast lookup by company
CREATE INDEX idx_intro_requests_company_id ON intro_requests(company_id);

-- RLS: service_role only
ALTER TABLE intro_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_requests FORCE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to intro_requests"
  ON intro_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
