-- Allow NULL coaching_id for platform-level users (e.g. superadmin)
ALTER TABLE users ALTER COLUMN coaching_id DROP NOT NULL;
