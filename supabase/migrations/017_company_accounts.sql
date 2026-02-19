-- Company accounts table for authenticated company access
CREATE TABLE company_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name    TEXT NOT NULL,
    contact_email   TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
    invited_by      TEXT,
    invited_at      TIMESTAMPTZ,
    first_login_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Index for auth user lookup (used on every request by getCompanyFromRequest)
CREATE INDEX idx_company_accounts_auth_user_id ON company_accounts(auth_user_id);

-- RLS: service_role only (consistent with company_access_log pattern)
ALTER TABLE company_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_accounts FORCE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to company_accounts"
  ON company_accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
