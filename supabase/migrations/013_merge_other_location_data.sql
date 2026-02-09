-- Merge desired_other_location text into desired_locations array.
-- Safe to run while old code is still live — does not drop anything.

-- Step 1: For rows with 'Others' + non-empty text, merge the text entries into the array
UPDATE user_profiles
SET desired_locations =
  COALESCE(
    (SELECT array_agg(elem) FROM unnest(desired_locations) AS elem WHERE elem != 'Others'),
    ARRAY[]::TEXT[]
  ) ||
  COALESCE(
    (SELECT array_agg(trim(both from elem))
     FROM unnest(string_to_array(desired_other_location, ',')) AS elem
     WHERE trim(both from elem) != ''),
    ARRAY[]::TEXT[]
  )
WHERE 'Others' = ANY(desired_locations)
  AND desired_other_location IS NOT NULL
  AND trim(desired_other_location) != '';

UPDATE talent_profiles
SET desired_locations =
  COALESCE(
    (SELECT array_agg(elem) FROM unnest(desired_locations) AS elem WHERE elem != 'Others'),
    ARRAY[]::TEXT[]
  ) ||
  COALESCE(
    (SELECT array_agg(trim(both from elem))
     FROM unnest(string_to_array(desired_other_location, ',')) AS elem
     WHERE trim(both from elem) != ''),
    ARRAY[]::TEXT[]
  )
WHERE 'Others' = ANY(desired_locations)
  AND desired_other_location IS NOT NULL
  AND trim(desired_other_location) != '';

-- Step 2: Clean up any remaining 'Others' sentinel (rows where text was empty/null)
UPDATE user_profiles
SET desired_locations = array_remove(desired_locations, 'Others')
WHERE 'Others' = ANY(desired_locations);

UPDATE talent_profiles
SET desired_locations = array_remove(desired_locations, 'Others')
WHERE 'Others' = ANY(desired_locations);
