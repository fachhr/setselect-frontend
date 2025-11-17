-- =====================================================
-- Migration: Add Auto-Increment talent_id
-- Description: Creates sequence for SVL-XXX format IDs
-- Author: Claude Code
-- Date: 2025-01-17
-- =====================================================

-- Step 1: Create sequence for talent IDs
-- Starts at 1, increments by 1
CREATE SEQUENCE IF NOT EXISTS talent_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- Step 2: Add talent_id column with auto-increment default
-- Format: SVL-001, SVL-002, SVL-003, etc.
-- If column doesn't exist, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'talent_id'
  ) THEN
    ALTER TABLE user_profiles
    ADD COLUMN talent_id TEXT;
  END IF;
END $$;

-- Step 3: Set default value for new records
-- LPAD ensures 3-digit padding (001, 002, ..., 999)
ALTER TABLE user_profiles
  ALTER COLUMN talent_id SET DEFAULT 'SVL-' || LPAD(nextval('talent_id_seq')::text, 3, '0');

-- Step 4: Backfill existing records without talent_id
-- Only updates NULL values, preserves existing IDs
UPDATE user_profiles
SET talent_id = 'SVL-' || LPAD(nextval('talent_id_seq')::text, 3, '0')
WHERE talent_id IS NULL;

-- Step 5: Make talent_id NOT NULL and add unique constraint
ALTER TABLE user_profiles
  ALTER COLUMN talent_id SET NOT NULL;

-- Step 6: Add unique constraint to prevent duplicates
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_talent_id_key;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_talent_id_key UNIQUE (talent_id);

-- Step 7: Create index for fast lookups by talent_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_talent_id
  ON user_profiles (talent_id);

-- Verification query (run this to test):
-- SELECT talent_id, contact_first_name, created_at
-- FROM user_profiles
-- ORDER BY created_at DESC
-- LIMIT 10;

COMMENT ON COLUMN user_profiles.talent_id IS 'Auto-generated unique identifier in format SVL-XXX for public display';
COMMENT ON SEQUENCE talent_id_seq IS 'Sequence for generating talent_id values starting from 001';
