-- Migration 013: Add Thumbnail URL to Batches
-- Purpose: Add a thumbnail_url column to the batches table.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE batches ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

COMMIT;
