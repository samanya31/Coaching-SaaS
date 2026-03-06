-- Platform-wide settings table (managed by super admin only)
CREATE TABLE IF NOT EXISTS platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    settings JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row so there's always one row to update
INSERT INTO platform_settings (id, settings)
VALUES ('global', '{}')
ON CONFLICT (id) DO NOTHING;

-- Only super admins can read/write (service role used from edge functions)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow Super Admins to manage platform settings
CREATE POLICY "superadmins_manage_platform_settings" ON platform_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'superadmin'
        )
    );

-- Allow all authenticated users (like Coaching Admins) to read platform settings
CREATE POLICY "authenticated_read_platform_settings" ON platform_settings
    FOR SELECT
    TO authenticated
    USING (true);
