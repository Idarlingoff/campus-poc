-- migrate:up
CREATE TABLE IF NOT EXISTS campuses (
                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE TABLE IF NOT EXISTS themes (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

-- migrate:down
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS campuses;
