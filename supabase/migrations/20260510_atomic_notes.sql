-- Atomic note operations to prevent race conditions on concurrent writes

CREATE OR REPLACE FUNCTION prepend_note(
  p_profile_id UUID,
  p_note JSONB,
  p_now TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  UPDATE recruiter_candidates
  SET notes = COALESCE(p_note, '[]'::jsonb) || COALESCE(notes, '[]'::jsonb),
      updated_at = p_now,
      last_activity_at = p_now
  WHERE profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_note(
  p_profile_id UUID,
  p_note_id TEXT,
  p_now TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  UPDATE recruiter_candidates
  SET notes = (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(COALESCE(notes, '[]'::jsonb)) AS elem
    WHERE elem->>'id' != p_note_id
  ),
  updated_at = p_now,
  last_activity_at = p_now
  WHERE profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql;
