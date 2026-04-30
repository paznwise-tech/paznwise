-- ─────────────────────────────────────────────
-- 003_feed_tables.sql
-- Feed system: posts, interactions, follows, preferences
-- NOTE: Prisma uses PascalCase table names → "User" not users
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS posts (
  id              SERIAL PRIMARY KEY,
  artist_id       TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  category        TEXT NOT NULL CHECK (category IN (
                    'painting','sculpture','digital_art','photography',
                    'music','dance','mehendi','prints','craft','live_event')),
  medium          TEXT,
  style           TEXT CHECK (style IN (
                    'abstract','realism','surrealism','folk','contemporary','impressionist')),
  price_tier      TEXT CHECK (price_tier IN ('budget','mid','premium','luxury')),
  price           NUMERIC(12,2),
  image_url       TEXT NOT NULL,
  title           TEXT,
  height          INT NOT NULL DEFAULT 300,
  description     TEXT,
  likes_count     INT NOT NULL DEFAULT 0,
  saves_count     INT NOT NULL DEFAULT 0,
  shares_count    INT NOT NULL DEFAULT 0,
  comments_count  INT NOT NULL DEFAULT 0,
  views_count     INT NOT NULL DEFAULT 0,
  purchases_count INT NOT NULL DEFAULT 0,
  is_promoted     BOOLEAN NOT NULL DEFAULT false,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interactions (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  post_id    INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  action     TEXT NOT NULL CHECK (action IN ('like','save','share','view','purchase','skip')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_follows (
  follower_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  artist_id   TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, artist_id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id           TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
  liked_categories  TEXT[] DEFAULT '{}',
  liked_styles      TEXT[] DEFAULT '{}',
  price_tier_pref   TEXT DEFAULT 'mid',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_interactions_user    ON interactions(user_id, action);
CREATE INDEX IF NOT EXISTS idx_interactions_post    ON interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_artist         ON posts(artist_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_style ON posts(category, style);
CREATE INDEX IF NOT EXISTS idx_posts_created        ON posts(created_at DESC);
