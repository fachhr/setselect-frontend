-- Track company access to talent pool
-- Logs both successful unlocks and access requests (lead capture)

CREATE TABLE IF NOT EXISTS company_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    access_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by email
CREATE INDEX IF NOT EXISTS idx_company_access_log_email ON company_access_log(email);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_company_access_log_created_at ON company_access_log(created_at DESC);

-- Ensure access_type is valid
ALTER TABLE company_access_log
ADD CONSTRAINT chk_access_type
CHECK (access_type IN ('unlock', 'request'));

COMMENT ON TABLE company_access_log IS 'Tracks company access to talent pool for analytics and lead capture';
COMMENT ON COLUMN company_access_log.access_type IS 'Either unlock (valid code) or request (lead capture)';
