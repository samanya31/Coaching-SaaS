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

-- No public access — only service role key (used by edge function) can read
CREATE POLICY "service_role_only" ON platform_settings
    USING (false);
