-- migrate:up
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publication_type') THEN
CREATE TYPE publication_type AS ENUM ('POST', 'EVENT', 'CAMPUS_ANNOUNCEMENT');
END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publication_visibility') THEN
CREATE TYPE publication_visibility AS ENUM ('PUBLIC', 'CAMPUS_ONLY');
END IF;
END $$;

CREATE TABLE IF NOT EXISTS publications (
                                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type publication_type NOT NULL,

    title TEXT NOT NULL,
    content_html TEXT NOT NULL,

    visibility publication_visibility NOT NULL DEFAULT 'PUBLIC',

    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campus_id UUID NULL REFERENCES campuses(id) ON DELETE SET NULL,
    theme_id UUID NULL REFERENCES themes(id) ON DELETE SET NULL,

    -- Champs event (NULL si pas EVENT)
    event_start_at TIMESTAMPTZ NULL,
    event_end_at TIMESTAMPTZ NULL,

    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE INDEX IF NOT EXISTS idx_publications_published_at ON publications(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_publications_type ON publications(type);
CREATE INDEX IF NOT EXISTS idx_publications_campus_id ON publications(campus_id);
CREATE INDEX IF NOT EXISTS idx_publications_theme_id ON publications(theme_id);
CREATE INDEX IF NOT EXISTS idx_publications_author_user_id ON publications(author_user_id);

CREATE TABLE IF NOT EXISTS publication_reports (
                                                   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    reporter_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE INDEX IF NOT EXISTS idx_publication_reports_publication_id ON publication_reports(publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_reports_created_at ON publication_reports(created_at DESC);

-- migrate:down
DROP TABLE IF EXISTS publication_reports;
DROP TABLE IF EXISTS publications;
DROP TYPE IF EXISTS publication_visibility;
DROP TYPE IF EXISTS publication_type;
