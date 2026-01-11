-- migrate:up

-- Ajouter la colonne campus_id à la table users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS campus_id UUID NULL REFERENCES campuses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_campus_id ON users(campus_id);

-- Migrer les données existantes de user_profile vers users
UPDATE users u
SET campus_id = up.campus_id
FROM user_profile up
WHERE u.id = up.user_id
  AND up.campus_id IS NOT NULL;

-- Supprimer la colonne campus_id de user_profile
DROP INDEX IF EXISTS idx_user_profile_campus_id;
ALTER TABLE user_profile DROP COLUMN IF EXISTS campus_id;

-- migrate:down

-- Restaurer la colonne campus_id dans user_profile
ALTER TABLE user_profile
    ADD COLUMN IF NOT EXISTS campus_id UUID NULL REFERENCES campuses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profile_campus_id ON user_profile(campus_id);

-- Migrer les données de users vers user_profile
UPDATE user_profile up
SET campus_id = u.campus_id
FROM users u
WHERE up.user_id = u.id
  AND u.campus_id IS NOT NULL;

-- Supprimer la colonne campus_id de users
DROP INDEX IF EXISTS idx_users_campus_id;
ALTER TABLE users DROP COLUMN IF EXISTS campus_id;
