-- Replace canton abbreviations with full location names
-- in both user_profiles and talent_profiles tables

UPDATE user_profiles
SET desired_locations = array_replace(
      array_replace(
        array_replace(
          array_replace(
            array_replace(desired_locations, 'ZG', 'Zug'),
          'ZH', 'Zurich'),
        'GE', 'Geneva'),
      'BE', 'Bern'),
    'CH', 'Switzerland')
WHERE desired_locations && ARRAY['ZG','ZH','GE','BE','CH'];

UPDATE talent_profiles
SET desired_locations = array_replace(
      array_replace(
        array_replace(
          array_replace(
            array_replace(desired_locations, 'ZG', 'Zug'),
          'ZH', 'Zurich'),
        'GE', 'Geneva'),
      'BE', 'Bern'),
    'CH', 'Switzerland')
WHERE desired_locations && ARRAY['ZG','ZH','GE','BE','CH'];
