-- migrate:up
CREATE TABLE IF NOT EXISTS publication_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID NULL REFERENCES publication_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publication_comments_publication_id ON publication_comments(publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_comments_author_user_id ON publication_comments(author_user_id);
CREATE INDEX IF NOT EXISTS idx_publication_comments_parent_comment_id ON publication_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_publication_comments_created_at ON publication_comments(created_at DESC);

-- migrate:down
DROP TABLE IF EXISTS publication_comments;
