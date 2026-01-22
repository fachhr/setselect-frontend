-- =====================================================
-- Migration: Rename SVL prefix to REF
-- Description: Updates talent_id prefix from SVL to REF
-- Author: Claude Code
-- Date: 2025-01-22
-- =====================================================

-- Step 1: Update the default value for new records
-- Changes prefix from SVL- to REF-
ALTER TABLE user_profiles
  ALTER COLUMN talent_id SET DEFAULT 'REF-' || LPAD(nextval('talent_id_seq')::text, 3, '0');

-- Step 2: Update all existing records from SVL-XXX to REF-XXX
UPDATE user_profiles
SET talent_id = REPLACE(talent_id, 'SVL-', 'REF-')
WHERE talent_id LIKE 'SVL-%';

-- Step 3: Update column comment to reflect new format
COMMENT ON COLUMN user_profiles.talent_id IS 'Auto-generated unique identifier in format REF-XXX for public display';

-- Verification query (run this to test):
-- SELECT talent_id, contact_first_name, created_at
-- FROM user_profiles
-- ORDER BY created_at DESC
-- LIMIT 10;
