-- Migration to add 'metadata' column to users table
-- This fixes the error "Could not find the 'metadata' column of 'users' in the schema cache"
-- when creating instructors or students with extra details.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'metadata') THEN
        ALTER TABLE users ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

COMMIT;
