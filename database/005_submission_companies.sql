-- Separate submission-target companies from platform-access company_accounts.
-- Submissions are manual; company_accounts gates portal access. Different concerns.

CREATE TABLE IF NOT EXISTS submission_companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),

  UNIQUE(name)
);

CREATE INDEX idx_submission_companies_name ON submission_companies(name);

ALTER TABLE submission_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on submission_companies"
  ON submission_companies FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Migrate: copy any company_accounts already referenced by existing submissions
INSERT INTO submission_companies (id, name)
SELECT DISTINCT ca.id, ca.company_name
FROM company_accounts ca
JOIN candidate_submissions cs ON cs.company_id = ca.id
ON CONFLICT (name) DO NOTHING;

-- Re-point the FK from company_accounts → submission_companies
ALTER TABLE candidate_submissions
  DROP CONSTRAINT IF EXISTS candidate_submissions_company_id_fkey;

ALTER TABLE candidate_submissions
  ADD CONSTRAINT candidate_submissions_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES submission_companies(id) ON DELETE CASCADE;
