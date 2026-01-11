-- migrate:up
CREATE TABLE IF NOT EXISTS publication_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_publication_like_per_user UNIQUE (publication_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_publication_likes_publication_id ON publication_likes(publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_likes_user_id ON publication_likes(user_id);

-- migrate:down
DROP TABLE IF EXISTS publication_likes;
