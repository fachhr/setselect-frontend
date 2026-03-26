-- Track which candidates were submitted to which companies, by whom
CREATE TABLE IF NOT EXISTS candidate_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company_id     UUID NOT NULL REFERENCES company_accounts(id) ON DELETE CASCADE,
  submitted_by   TEXT,
  status         TEXT NOT NULL DEFAULT 'submitted'
                 CHECK (status IN ('submitted', 'interviewing', 'rejected', 'placed')),
  notes          TEXT,
  submitted_at   TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),

  -- One submission per candidate per company
  UNIQUE(profile_id, company_id)
);

CREATE INDEX idx_submissions_profile ON candidate_submissions(profile_id);
CREATE INDEX idx_submissions_company ON candidate_submissions(company_id);
CREATE INDEX idx_submissions_status  ON candidate_submissions(status);

ALTER TABLE candidate_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on candidate_submissions"
  ON candidate_submissions FOR ALL TO service_role
  USING (true) WITH CHECK (true);
