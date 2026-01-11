-- migrate:up
CREATE TABLE IF NOT EXISTS institutional_news (
                                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    excerpt TEXT NULL,
    content_html TEXT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE INDEX IF NOT EXISTS idx_institutional_news_featured ON institutional_news(is_featured DESC, published_at DESC);

CREATE TABLE IF NOT EXISTS city_news (
                                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NULL,
    url TEXT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE INDEX IF NOT EXISTS idx_city_news_city ON city_news(city);
CREATE INDEX IF NOT EXISTS idx_city_news_published ON city_news(published_at DESC);

-- migrate:down
DROP TABLE IF EXISTS city_news;
DROP TABLE IF EXISTS institutional_news;