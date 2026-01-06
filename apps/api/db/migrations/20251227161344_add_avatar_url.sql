-- migrate:up
ALTER TABLE user_profile
    ADD COLUMN IF NOT EXISTS avatar_url text;

-- Optionnel: petit check "ça ressemble à une url"
-- ALTER TABLE user_profile
--   ADD CONSTRAINT chk_avatar_url_len CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 500);

-- migrate:down
ALTER TABLE user_profile
DROP COLUMN IF EXISTS avatar_url;
