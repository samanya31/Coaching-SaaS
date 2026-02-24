-- Migration to fix batches table schema
-- Adds 'metadata' and 'tags' columns which are used by the frontend but missing in the initial schema.
-- Also ensures 'exam_goal' exists.

BEGIN;

-- 1. Add 'metadata' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'metadata') THEN
        ALTER TABLE batches ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Add 'tags' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'tags') THEN
        ALTER TABLE batches ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 3. Ensure 'exam_goal' column exists (it should, but safety first)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'exam_goal') THEN
        ALTER TABLE batches ADD COLUMN exam_goal TEXT DEFAULT 'General';
    END IF;
END $$;

COMMIT;
