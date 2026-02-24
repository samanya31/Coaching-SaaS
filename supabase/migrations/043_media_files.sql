-- =====================================================
-- MIGRATION 043: MEDIA FILES TRACKING
-- =====================================================
-- Tracks every file uploaded to R2 storage so admins
-- can see storage usage per institute, per category.
-- =====================================================

CREATE TABLE IF NOT EXISTS media_files (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- File info
    file_name   TEXT NOT NULL,
    file_size   BIGINT NOT NULL DEFAULT 0,  -- bytes
    mime_type   TEXT,
    category    TEXT NOT NULL,              -- 'videos' | 'thumbnails' | 'materials' | 'logos' | 'avatars'
    sub_folder  TEXT,                       -- e.g. course_id for videos, user_id for avatars

    -- R2 location
    r2_key      TEXT NOT NULL UNIQUE,       -- full object key in the bucket
    public_url  TEXT NOT NULL,

    -- Reference (optional — links back to the entity that owns this file)
    entity_type TEXT,                       -- 'batch' | 'course' | 'user' | 'coaching'
    entity_id   TEXT,

    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-coaching queries
CREATE INDEX IF NOT EXISTS idx_media_files_coaching ON media_files(coaching_id);
CREATE INDEX IF NOT EXISTS idx_media_files_category ON media_files(coaching_id, category);

-- RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Admins can see/manage their own coaching's media
DROP POLICY IF EXISTS "Admins manage own media" ON media_files;
CREATE POLICY "Admins manage own media"
    ON media_files FOR ALL
    USING (
        coaching_id = (
            SELECT coaching_id FROM users
            WHERE id = auth.uid()
            LIMIT 1
        )
    );

-- Helper view: storage usage summary per coaching
CREATE OR REPLACE VIEW coaching_storage_summary AS
SELECT
    coaching_id,
    category,
    COUNT(*)                            AS file_count,
    SUM(file_size)                      AS total_bytes,
    ROUND(SUM(file_size) / 1048576.0, 2) AS total_mb
FROM media_files
GROUP BY coaching_id, category;
