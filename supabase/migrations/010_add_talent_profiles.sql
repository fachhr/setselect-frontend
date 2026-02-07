-- =====================================================
-- Migration: Add talent_profiles Display Table
-- Description: Creates a PII-free table for public
--   candidate display. user_profiles remains the
--   single source of truth; talent_profiles holds
--   only neutralised display data.
-- Author: Claude Code
-- Date: 2026-02-07
-- =====================================================

-- =====================================================
-- TABLE: talent_profiles
-- =====================================================
-- Zero PII. No names, emails, phones, LinkedIn,
-- addresses, or company names.

CREATE TABLE IF NOT EXISTS talent_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  talent_id       TEXT UNIQUE,

  -- Form-provided fields (display-safe)
  years_of_experience   INTEGER,
  work_eligibility      TEXT,
  desired_roles         TEXT,
  notice_period_months  TEXT,
  desired_locations     TEXT[],
  desired_other_location TEXT,
  salary_min            INTEGER,
  salary_max            INTEGER,
  highlight             TEXT,
  languages             TEXT[],
  functional_expertise  TEXT[],
  other_expertise       TEXT,

  -- Parser-generated fields (display-safe)
  profile_bio                TEXT,
  short_summary              TEXT,
  education_history          JSONB,
  professional_experience    JSONB,   -- companyName stripped
  technical_skills           JSONB,
  soft_skills                JSONB,
  industry_specific_skills   JSONB,
  certifications             JSONB,
  professional_interests     JSONB,
  extracurricular_activities JSONB,
  base_projects              JSONB,
  base_languages             JSONB,

  -- Timestamps
  parsing_completed_at  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE talent_profiles IS
  'PII-free display table for the public talent pool. Mirrors selected fields from user_profiles with identifying data (names, emails, company names) removed.';

-- =====================================================
-- INDEXES (matching patterns from 002_performance_indexes)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_talent_profiles_created_at_desc
  ON talent_profiles (created_at DESC);

COMMENT ON INDEX idx_talent_profiles_created_at_desc IS
  'Optimizes default sorting by newest first';

CREATE INDEX IF NOT EXISTS idx_talent_profiles_years_experience
  ON talent_profiles (years_of_experience)
  WHERE years_of_experience IS NOT NULL;

COMMENT ON INDEX idx_talent_profiles_years_experience IS
  'Optimizes seniority filtering queries';

CREATE INDEX IF NOT EXISTS idx_talent_profiles_salary_range
  ON talent_profiles (salary_min, salary_max)
  WHERE salary_min IS NOT NULL OR salary_max IS NOT NULL;

COMMENT ON INDEX idx_talent_profiles_salary_range IS
  'Optimizes salary range filtering queries';

CREATE INDEX IF NOT EXISTS idx_talent_profiles_desired_locations
  ON talent_profiles USING GIN (desired_locations);

COMMENT ON INDEX idx_talent_profiles_desired_locations IS
  'Optimizes canton/location filtering using array overlap';

CREATE INDEX IF NOT EXISTS idx_talent_profiles_languages
  ON talent_profiles USING GIN (languages);

COMMENT ON INDEX idx_talent_profiles_languages IS
  'Optimizes language filtering using array contains';

CREATE INDEX IF NOT EXISTS idx_talent_profiles_filtering
  ON talent_profiles (created_at DESC, years_of_experience, salary_max);

COMMENT ON INDEX idx_talent_profiles_filtering IS
  'Composite index for common filtering + sorting pattern';

CREATE INDEX IF NOT EXISTS idx_talent_profiles_parsing_status
  ON talent_profiles (parsing_completed_at)
  WHERE parsing_completed_at IS NULL;

COMMENT ON INDEX idx_talent_profiles_parsing_status IS
  'Finds profiles with pending CV parsing';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

-- Block anonymous/public access — only service_role can read/write
-- (Frontend API routes use supabaseAdmin with service_role key)

-- =====================================================
-- BACKFILL from existing user_profiles
-- =====================================================
-- Strip companyName from each professional_experience entry.
-- All PII columns are excluded by design (they don't exist
-- on talent_profiles).

INSERT INTO talent_profiles (
  profile_id,
  talent_id,
  years_of_experience,
  work_eligibility,
  desired_roles,
  notice_period_months,
  desired_locations,
  desired_other_location,
  salary_min,
  salary_max,
  highlight,
  languages,
  functional_expertise,
  other_expertise,
  profile_bio,
  short_summary,
  education_history,
  professional_experience,
  technical_skills,
  soft_skills,
  industry_specific_skills,
  certifications,
  professional_interests,
  extracurricular_activities,
  base_projects,
  base_languages,
  parsing_completed_at,
  created_at
)
SELECT
  up.id,
  up.talent_id,
  up.years_of_experience,
  up.work_eligibility,
  up.desired_roles,
  up.notice_period_months,
  up.desired_locations,
  up.desired_other_location,
  up.salary_min,
  up.salary_max,
  up.highlight,
  up.languages,
  up.functional_expertise,
  up.other_expertise,
  up.profile_bio,
  up.short_summary,
  up.education_history,
  -- Strip companyName from each professional_experience entry
  CASE
    WHEN up.professional_experience IS NOT NULL THEN (
      SELECT jsonb_agg(entry - 'companyName')
      FROM jsonb_array_elements(up.professional_experience) AS entry
    )
    ELSE NULL
  END,
  up.technical_skills,
  up.soft_skills,
  up.industry_specific_skills,
  up.certifications,
  up.professional_interests,
  up.extracurricular_activities,
  up.base_projects,
  up.base_languages,
  up.parsing_completed_at,
  up.created_at
FROM user_profiles up
ON CONFLICT (profile_id) DO NOTHING;

-- Statistics update
ANALYZE talent_profiles;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
