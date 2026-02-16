-- Backfill talent_profiles with current user_profiles data
-- for the non-PII fields that are now kept in sync by the API.
UPDATE talent_profiles tp
SET
  years_of_experience  = up.years_of_experience,
  desired_roles        = up.desired_roles,
  desired_locations    = up.desired_locations,
  salary_min           = up.salary_min,
  salary_max           = up.salary_max,
  notice_period_months = up.notice_period_months,
  work_eligibility     = up.work_eligibility,
  short_summary        = up.short_summary,
  functional_expertise = up.functional_expertise,
  languages            = up.languages
FROM user_profiles up
WHERE tp.profile_id = up.id;
