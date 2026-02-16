-- =====================================================
-- Migration: Consolidate languages + base_languages
-- Description: Merges TEXT[] languages column into
--   JSONB base_languages, then renames to languages.
--   Applies to both user_profiles and talent_profiles.
-- Author: Claude Code
-- Date: 2026-02-16
-- =====================================================

-- =====================================================
-- STEP 1: Merge TEXT[] languages into JSONB base_languages
-- =====================================================
-- For each table:
--   - Convert each TEXT[] entry to {"language": "name"}
--   - Strip parenthetical annotations (e.g. "Mandarin (Native)" → "Mandarin")
--   - Skip entries already present in base_languages (case-insensitive)
--   - Prefer base_languages entries (they have proficiency from parser)

-- user_profiles
UPDATE user_profiles
SET base_languages = (
  SELECT COALESCE(jsonb_agg(merged ORDER BY merged->>'language'), '[]'::jsonb)
  FROM (
    -- Existing base_languages entries (parser-provided, have proficiency)
    SELECT elem AS merged
    FROM jsonb_array_elements(COALESCE(base_languages, '[]'::jsonb)) AS elem
    UNION ALL
    -- TEXT[] languages entries not already in base_languages
    SELECT jsonb_build_object('language', TRIM(regexp_replace(lang, '\s*\([^)]*\)\s*$', ''))) AS merged
    FROM unnest(COALESCE(languages, ARRAY[]::TEXT[])) AS lang
    WHERE NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(base_languages, '[]'::jsonb)) AS existing
      WHERE LOWER(existing->>'language') = LOWER(TRIM(regexp_replace(lang, '\s*\([^)]*\)\s*$', '')))
    )
    AND TRIM(regexp_replace(lang, '\s*\([^)]*\)\s*$', '')) <> ''
  ) combined
)
WHERE languages IS NOT NULL OR base_languages IS NOT NULL;

-- talent_profiles
UPDATE talent_profiles
SET base_languages = (
  SELECT COALESCE(jsonb_agg(merged ORDER BY merged->>'language'), '[]'::jsonb)
  FROM (
    -- Existing base_languages entries (parser-provided, have proficiency)
    SELECT elem AS merged
    FROM jsonb_array_elements(COALESCE(base_languages, '[]'::jsonb)) AS elem
    UNION ALL
    -- TEXT[] languages entries not already in base_languages
    SELECT jsonb_build_object('language', TRIM(regexp_replace(lang, '\s*\([^)]*\)\s*$', ''))) AS merged
    FROM unnest(COALESCE(languages, ARRAY[]::TEXT[])) AS lang
    WHERE NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(base_languages, '[]'::jsonb)) AS existing
      WHERE LOWER(existing->>'language') = LOWER(TRIM(regexp_replace(lang, '\s*\([^)]*\)\s*$', '')))
    )
    AND TRIM(regexp_replace(lang, '\s*\([^)]*\)\s*$', '')) <> ''
  ) combined
)
WHERE languages IS NOT NULL OR base_languages IS NOT NULL;

-- =====================================================
-- STEP 2: Drop TEXT[] languages column
-- =====================================================

ALTER TABLE user_profiles DROP COLUMN languages;
ALTER TABLE talent_profiles DROP COLUMN languages;

-- =====================================================
-- STEP 3: Rename base_languages → languages
-- =====================================================

ALTER TABLE user_profiles RENAME COLUMN base_languages TO languages;
ALTER TABLE talent_profiles RENAME COLUMN base_languages TO languages;

-- =====================================================
-- STEP 4: Recreate GIN index on renamed column
-- =====================================================
-- The old GIN index on talent_profiles.languages (TEXT[]) was dropped
-- with the column. Create a new one for JSONB containment queries.

DROP INDEX IF EXISTS idx_talent_profiles_languages;

CREATE INDEX idx_talent_profiles_languages
  ON talent_profiles USING GIN (languages jsonb_path_ops);

COMMENT ON INDEX idx_talent_profiles_languages IS
  'Optimizes JSONB containment queries on languages (e.g. @> filter)';

-- Also index user_profiles.languages for consistency
CREATE INDEX IF NOT EXISTS idx_user_profiles_languages
  ON user_profiles USING GIN (languages jsonb_path_ops);

-- =====================================================
-- STEP 5: Verify (informational)
-- =====================================================
-- After running, verify:
--   SELECT languages FROM talent_profiles LIMIT 5;
--   Should show: [{"language": "English", "proficiency": "C2"}, ...]

-- =====================================================
-- END OF MIGRATION
-- =====================================================
