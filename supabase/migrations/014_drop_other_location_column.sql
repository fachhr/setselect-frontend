-- Drop the now-unused desired_other_location column.
-- Only run AFTER the code that references this column has been deployed.
ALTER TABLE user_profiles DROP COLUMN IF EXISTS desired_other_location;
ALTER TABLE talent_profiles DROP COLUMN IF EXISTS desired_other_location;
