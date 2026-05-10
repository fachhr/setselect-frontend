-- SetSelect Multi-Market Migration
-- Run this BEFORE deploying the updated frontend code.
-- Safe to run multiple times (IF NOT EXISTS pattern).

-- Step 1: Add market column to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'market'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN market TEXT NOT NULL DEFAULT 'CH';
    CREATE INDEX idx_user_profiles_market ON user_profiles(market);
    RAISE NOTICE 'Added market column to user_profiles';
  ELSE
    RAISE NOTICE 'market column already exists on user_profiles — skipping';
  END IF;
END $$;

-- Step 2: Add market column to talent_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'talent_profiles' AND column_name = 'market'
  ) THEN
    ALTER TABLE talent_profiles ADD COLUMN market TEXT NOT NULL DEFAULT 'CH';
    CREATE INDEX idx_talent_profiles_market ON talent_profiles(market);
    RAISE NOTICE 'Added market column to talent_profiles';
  ELSE
    RAISE NOTICE 'market column already exists on talent_profiles — skipping';
  END IF;
END $$;

-- Verification
SELECT table_name, column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_name IN ('user_profiles', 'talent_profiles')
  AND column_name = 'market';
