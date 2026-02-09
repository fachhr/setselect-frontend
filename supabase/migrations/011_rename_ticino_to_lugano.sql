-- Replace 'TI' with 'Lugano' in desired_locations arrays
UPDATE user_profiles
SET desired_locations = array_replace(desired_locations, 'TI', 'Lugano')
WHERE 'TI' = ANY(desired_locations);

UPDATE talent_profiles
SET desired_locations = array_replace(desired_locations, 'TI', 'Lugano')
WHERE 'TI' = ANY(desired_locations);
