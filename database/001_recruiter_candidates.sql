CREATE TABLE IF NOT EXISTS recruiter_candidates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','screening','interviewing','offer','placed','rejected')),
  owner             TEXT,
  notes             JSONB DEFAULT '[]'::JSONB,
  status_changed_at TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recruiter_candidates_status ON recruiter_candidates(status);
CREATE INDEX idx_recruiter_candidates_owner ON recruiter_candidates(owner);
CREATE INDEX idx_recruiter_candidates_profile ON recruiter_candidates(profile_id);

ALTER TABLE recruiter_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on recruiter_candidates"
  ON recruiter_candidates FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Backfill existing profiles
INSERT INTO recruiter_candidates (profile_id, status)
SELECT id, 'new' FROM user_profiles
ON CONFLICT (profile_id) DO NOTHING;

-- Auto-create row for new profiles
CREATE OR REPLACE FUNCTION auto_create_recruiter_candidate()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO recruiter_candidates (profile_id, status)
  VALUES (NEW.id, 'new') ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_recruiter_candidate
  AFTER INSERT ON user_profiles FOR EACH ROW
  EXECUTE FUNCTION auto_create_recruiter_candidate();
