-- migrate:up
ALTER TABLE user_profile
    ADD COLUMN IF NOT EXISTS campus_id UUID NULL REFERENCES campuses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profile_campus_id ON user_profile(campus_id);

-- migrate:down
ALTER TABLE user_profile DROP COLUMN IF EXISTS campus_id;
