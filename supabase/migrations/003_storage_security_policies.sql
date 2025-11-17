-- =====================================================
-- Migration: Storage Security Policies for CV Bucket
-- Description: Ensures proper RLS for talent-pool-cvs
-- Author: Claude Code
-- Date: 2025-01-17
-- Security: Prevents unauthorized access to CVs
-- =====================================================

-- NOTE: Storage policies are separate from table RLS
-- These run in Supabase Dashboard > Storage > talent-pool-cvs > Policies

-- Drop existing policies if any (clean slate)
DROP POLICY IF EXISTS "Service role can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can read CVs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete CVs" ON storage.objects;
DROP POLICY IF EXISTS "Public cannot access CVs" ON storage.objects;

-- Policy 1: Allow service role to INSERT (upload CVs)
CREATE POLICY "Service role can upload CVs"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (
    bucket_id = 'talent-pool-cvs'
  );

-- Policy 2: Allow service role to SELECT (read CVs for parsing)
CREATE POLICY "Service role can read CVs"
  ON storage.objects
  FOR SELECT
  TO service_role
  USING (
    bucket_id = 'talent-pool-cvs'
  );

-- Policy 3: Allow service role to DELETE (cleanup old CVs)
CREATE POLICY "Service role can delete CVs"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (
    bucket_id = 'talent-pool-cvs'
  );

-- Policy 4: DENY all public access
-- Note: No policy for 'anon' or 'authenticated' = access denied by default
-- This is intentional - CVs are sensitive data

-- Verification queries:
-- 1. Check policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%CVs%';

-- 2. Test upload (should succeed with service_role):
-- Via supabaseAdmin.storage.from('talent-pool-cvs').upload(...)

-- 3. Test public access (should fail):
-- Via supabase.storage.from('talent-pool-cvs').list()
-- Expected: No access error

-- Bucket configuration check
DO $$
BEGIN
  -- Ensure bucket exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'talent-pool-cvs'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('talent-pool-cvs', 'talent-pool-cvs', false);

    RAISE NOTICE 'Created bucket: talent-pool-cvs';
  ELSE
    -- Ensure bucket is NOT public
    UPDATE storage.buckets
    SET public = false
    WHERE id = 'talent-pool-cvs' AND public = true;

    RAISE NOTICE 'Bucket talent-pool-cvs already exists';
  END IF;
END $$;

-- Add bucket metadata
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';

-- Security audit log (optional)
-- Creates a function to log CV access attempts
CREATE OR REPLACE FUNCTION log_cv_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log to a separate audit table (create if needed)
  -- INSERT INTO cv_access_log (object_id, action, user_id, timestamp)
  -- VALUES (NEW.id, TG_OP, auth.uid(), NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Uncomment trigger if you want access logging
-- CREATE TRIGGER cv_access_audit
--   AFTER INSERT OR UPDATE OR DELETE ON storage.objects
--   FOR EACH ROW
--   WHEN (NEW.bucket_id = 'talent-pool-cvs')
--   EXECUTE FUNCTION log_cv_access();
