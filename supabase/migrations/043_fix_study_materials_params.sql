-- Fix Foreign Key Relationship for Study Materials
-- This ensures the link between study_materials and batches is correctly defined and named.

DO $$
BEGIN
    -- 1. Drop the constraint if it exists (to ensure we recreate it correctly with the known name)
    -- We try to catch common names or just the one we want to enforce
    BEGIN
        ALTER TABLE study_materials DROP CONSTRAINT IF EXISTS study_materials_batch_id_fkey;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore if it doesn't exist or other minor issues
        NULL;
    END;

    -- 2. Add the constraint explicitly
    -- We ensure batch_id is UUID first (it should be, but safety check is good, or we just trust previous migrations)
    
    ALTER TABLE study_materials
    ADD CONSTRAINT study_materials_batch_id_fkey
    FOREIGN KEY (batch_id)
    REFERENCES batches(id)
    ON DELETE CASCADE;

END $$;
