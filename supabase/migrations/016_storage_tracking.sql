-- =============================================
-- Storage Tracking for SaaS Platform
-- =============================================
-- We track storage per institute in a dedicated table.
-- This is updated when files are uploaded/deleted.
-- A Supabase function/trigger will keep this updated.

CREATE TABLE IF NOT EXISTS storage_usage (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id       UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    bucket            TEXT NOT NULL DEFAULT 'media',  -- 'media' | 'documents' | 'avatars'
    file_path         TEXT NOT NULL,
    file_name         TEXT,
    file_size_bytes   BIGINT NOT NULL DEFAULT 0,
    mime_type         TEXT,
    uploaded_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    is_orphan         BOOLEAN NOT NULL DEFAULT false,  -- future: flag unreferenced files
    last_accessed_at  TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(bucket, file_path)
);

CREATE INDEX IF NOT EXISTS idx_storage_usage_coaching ON storage_usage(coaching_id);
CREATE INDEX IF NOT EXISTS idx_storage_usage_bucket ON storage_usage(bucket);
CREATE INDEX IF NOT EXISTS idx_storage_usage_orphan ON storage_usage(is_orphan) WHERE is_orphan = true;

-- RLS
ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "storage_superadmin_all" ON storage_usage
    FOR ALL
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superadmin')
    );

CREATE POLICY "storage_own_coaching" ON storage_usage
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.coaching_id = storage_usage.coaching_id)
    );

-- =============================================
-- View: Storage summary per coaching
-- =============================================
CREATE OR REPLACE VIEW v_storage_per_coaching AS
SELECT
    c.id                                    AS coaching_id,
    c.name                                  AS coaching_name,
    c.slug,
    c.plan,
    c.plan_id,
    COALESCE(SUM(su.file_size_bytes), 0)    AS total_bytes,
    COUNT(su.id)                            AS total_files,
    COUNT(su.id) FILTER (WHERE su.is_orphan) AS orphan_files,
    MAX(su.created_at)                      AS last_upload_at,
    -- Plan limit (join saas_plans)
    COALESCE(sp.max_storage_gb, 5)          AS plan_limit_gb
FROM coachings c
LEFT JOIN storage_usage su ON su.coaching_id = c.id
LEFT JOIN saas_plans sp ON sp.id = c.plan_id
GROUP BY c.id, c.name, c.slug, c.plan, c.plan_id, sp.max_storage_gb
ORDER BY total_bytes DESC;
