-- 044_fix_study_materials_final.sql
-- Forcefully fix the relationship between study_materials and batches
-- This version aggressively drops ALL policies on study_materials to resolve conflicts.

-- 1. Reload the schema cache just in case (PostgREST specific)
NOTIFY pgrst, 'reload schema';

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 2. Dynamically Drop ALL policies on 'study_materials'
    -- This ensures we don't miss any obscurely named policies that use batch_id
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'study_materials'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON study_materials';
    END LOOP;

    -- 3. Drop potential existing constraints regarding batch_id
    BEGIN
        ALTER TABLE study_materials DROP CONSTRAINT IF EXISTS study_materials_batch_id_fkey;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
        ALTER TABLE study_materials DROP CONSTRAINT IF EXISTS fk_study_materials_batches;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- 4. Modify column to ensure it is correct (UUID/Nullable)
    -- Now that ALL policies are dropped, this should succeed.
    ALTER TABLE study_materials 
    ALTER COLUMN batch_id TYPE UUID USING batch_id::UUID,
    ALTER COLUMN batch_id DROP NOT NULL;

    -- 5. Add the constraint with a SHORT, SIMPLE, UNIQUE name
    ALTER TABLE study_materials
    ADD CONSTRAINT fk_study_materials_batches
    FOREIGN KEY (batch_id)
    REFERENCES batches(id)
    ON DELETE CASCADE;

    -- 6. Re-create the RLS policies needed for the app
    
    -- Policy 1: Public materials (Current Affairs)
    CREATE POLICY "Public materials are viewable by everyone" 
    ON study_materials FOR SELECT 
    USING (is_public = true);

    -- Policy 2: Enrolled batch materials
    CREATE POLICY "Students can view study materials from enrolled batches" 
    ON study_materials FOR SELECT 
    USING (
        auth.role() = 'authenticated' AND (
            batch_id IN (
                SELECT batch_id 
                FROM batch_enrollments 
                WHERE user_id = auth.uid() 
                AND status = 'active'
            )
        )
    );
    
    -- Policy 3: Allow full access to admins/staff (if applicable, usually service role bypasses RLS anyway but good to be explicit if needed)
    -- Assuming service role handles writes, but if front-end admin uses user token:
    -- CREATE POLICY "Admins have full access" ON study_materials FOR ALL USING ( ... admin check ... );
    -- keeping simple for now based on current app pattern.

    -- Ensure RLS is enabled
    ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

END $$;

-- 7. Notify again to ensure the new constraint is picked up
NOTIFY pgrst, 'reload schema';
