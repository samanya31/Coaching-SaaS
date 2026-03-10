-- Migration 050: Fix Foreign Key Name and Reload Schema Cache
-- The frontend explicitly requests !fk_study_materials_batches, so we must name the constraint exactly that.

BEGIN;

-- 1. Drop the auto-generated foreign key constraint
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.study_materials'::regclass
      AND confrelid = 'public.batches'::regclass
      AND contype = 'f';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.study_materials DROP CONSTRAINT "%I"', constraint_name);
    END IF;
END $$;

-- 2. Add the correctly named constraint
ALTER TABLE public.study_materials
ADD CONSTRAINT fk_study_materials_batches
FOREIGN KEY (batch_id) REFERENCES public.batches(id) ON DELETE CASCADE;

COMMIT;

-- 3. Force PostgREST to reload the schema cache so the API immediately recognizes the new table structure and foreign key
NOTIFY pgrst, 'reload schema';
