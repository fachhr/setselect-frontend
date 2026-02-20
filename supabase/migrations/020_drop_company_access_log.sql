-- Remove legacy company_access_log table
-- Superseded by company_accounts with proper auth (migration 017)
DROP TABLE IF EXISTS company_access_log;
