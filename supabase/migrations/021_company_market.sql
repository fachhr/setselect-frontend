-- Add market column to company_accounts.
-- All existing companies are Swiss; DEFAULT 'CH' backfills them.
-- Safe online ALTER in Postgres 11+ (metadata-only, no table rewrite).

ALTER TABLE company_accounts
  ADD COLUMN market TEXT NOT NULL DEFAULT 'CH';

CREATE INDEX idx_company_accounts_market ON company_accounts(market);
