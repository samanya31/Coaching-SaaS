-- Migration 011: Fix Live Classes Schema
-- Purpose: Support text-based instructor names and ensure batch_id exists.

BEGIN;

-- 1. Ensure batch_id exists (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_classes' AND column_name = 'batch_id') THEN
        ALTER TABLE live_classes ADD COLUMN batch_id UUID REFERENCES batches(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Add 'instructor' text column (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_classes' AND column_name = 'instructor') THEN
        ALTER TABLE live_classes ADD COLUMN instructor TEXT;
    END IF;
END $$;

-- 3. Make instructor_id optional (since we are using text for now)
ALTER TABLE live_classes ALTER COLUMN instructor_id DROP NOT NULL;

COMMIT;
