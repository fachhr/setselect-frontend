-- Enable RLS (blocks all access by default)
ALTER TABLE company_access_log ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner (extra security)
ALTER TABLE company_access_log FORCE ROW LEVEL SECURITY;

-- Service role INSERT policy (for API route)
CREATE POLICY "Service role can insert access logs"
  ON company_access_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role SELECT policy (for admin queries)
CREATE POLICY "Service role can read access logs"
  ON company_access_log
  FOR SELECT
  TO service_role
  USING (true);

-- No policies for anon/authenticated = access denied
