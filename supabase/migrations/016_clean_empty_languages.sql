-- Remove JSONB entries where language is empty or null
UPDATE talent_profiles
SET languages = (
  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
  FROM jsonb_array_elements(languages) AS elem
  WHERE TRIM(COALESCE(elem->>'language', '')) <> ''
)
WHERE languages IS NOT NULL;

-- Same for user_profiles
UPDATE user_profiles
SET languages = (
  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
  FROM jsonb_array_elements(languages) AS elem
  WHERE TRIM(COALESCE(elem->>'language', '')) <> ''
)
WHERE languages IS NOT NULL;
