-- migrate:up

-- enums pour visibilité et affichage du nom
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_visibility') THEN
CREATE TYPE profile_visibility AS ENUM ('CAMPUS', 'PRIVATE');
END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'last_name_visibility') THEN
CREATE TYPE last_name_visibility AS ENUM ('FULL', 'INITIAL', 'HIDDEN');
END IF;
END$$;

ALTER TABLE user_profile
    ADD COLUMN IF NOT EXISTS first_name text,
    ADD COLUMN IF NOT EXISTS last_name text,
    ADD COLUMN IF NOT EXISTS birth_date date,
    ADD COLUMN IF NOT EXISTS show_email boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS show_birth_date boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS show_age boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS last_name_visibility last_name_visibility NOT NULL DEFAULT 'FULL',
    ADD COLUMN IF NOT EXISTS profile_visibility profile_visibility NOT NULL DEFAULT 'CAMPUS',
    ADD COLUMN IF NOT EXISTS instagram_handle text,
    ADD COLUMN IF NOT EXISTS linkedin_url text,
    ADD COLUMN IF NOT EXISTS website_url text,
    ADD COLUMN IF NOT EXISTS show_socials boolean NOT NULL DEFAULT true;

-- Optionnel: contraintes simples
-- (évite du garbage, sans être trop strict)
ALTER TABLE user_profile
    ADD CONSTRAINT chk_avatar_text_len CHECK (avatar_text IS NULL OR char_length(avatar_text) <= 3);

-- migrate:down

ALTER TABLE user_profile
DROP CONSTRAINT IF EXISTS chk_avatar_text_len;

ALTER TABLE user_profile
DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS birth_date,
  DROP COLUMN IF EXISTS show_email,
  DROP COLUMN IF EXISTS show_birth_date,
  DROP COLUMN IF EXISTS show_age,
  DROP COLUMN IF EXISTS last_name_visibility,
  DROP COLUMN IF EXISTS profile_visibility,
  DROP COLUMN IF EXISTS instagram_handle,
  DROP COLUMN IF EXISTS linkedin_url,
  DROP COLUMN IF EXISTS website_url,
  DROP COLUMN IF EXISTS show_socials;

DROP TYPE IF EXISTS profile_visibility;
DROP TYPE IF EXISTS last_name_visibility;
