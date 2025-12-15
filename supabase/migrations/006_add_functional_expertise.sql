-- ============================================================================
-- Migration: Add functional_expertise columns to user_profiles
-- ============================================================================
-- Purpose: Store user-selected and parser-determined functional expertise areas
-- When: User selects on form submission, parser supplements after CV extraction
-- Categories: Trading, Risk Management, Quantitative Analysis, Technology,
--             Operations, Finance, Leadership, Legal, Compliance, Research,
--             Analytics, Engineering
-- ============================================================================

-- functional_expertise: Array of expertise categories (user-selected + parser-supplemented)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS functional_expertise TEXT[];

COMMENT ON COLUMN user_profiles.functional_expertise IS
  'Functional expertise areas (1-8). User selects 1-5 on form, parser may supplement up to 8 total. Valid values: Trading, Risk Management, Quantitative Analysis, Technology, Operations, Finance, Leadership, Legal, Compliance, Research, Analytics, Engineering.';

-- other_expertise: Free-text field for specialized expertise not in predefined list
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS other_expertise TEXT;

COMMENT ON COLUMN user_profiles.other_expertise IS
  'User-provided free-text for expertise areas not in predefined list. Semicolon-separated (e.g., "Structured Products; Derivatives; LNG Trading").';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
