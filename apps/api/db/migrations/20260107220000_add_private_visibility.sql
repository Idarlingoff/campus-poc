-- migrate:up
ALTER TYPE publication_visibility ADD VALUE IF NOT EXISTS 'PRIVATE';

-- migrate:down
-- Note: PostgreSQL ne permet pas de supprimer une valeur d'un ENUM facilement
-- Il faudrait recréer le type, ce qui est complexe avec des données existantes

