-- Allow superadmin to read ALL media_files (cross-institute)
DROP POLICY IF EXISTS "Superadmin reads all media" ON media_files;
CREATE POLICY "Superadmin reads all media"
    ON media_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- Update coaching_storage_summary view to include coaching name + plan limit
CREATE OR REPLACE VIEW coaching_storage_summary AS
SELECT
    mf.coaching_id,
    mf.category,
    COUNT(*)                              AS file_count,
    SUM(mf.file_size)                     AS total_bytes,
    ROUND(SUM(mf.file_size) / 1048576.0, 2) AS total_mb
FROM media_files mf
GROUP BY mf.coaching_id, mf.category;
