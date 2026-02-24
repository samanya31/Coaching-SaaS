-- 045_fix_study_materials_rls.sql
-- re-enables management policies for staff members

-- 1. Allow staff to read all study materials in their coaching
-- (Note: relax_rls.sql might already allow all SELECT, but this is the proper staff policy)
DROP POLICY IF EXISTS "Staff can view all study materials in coaching" ON study_materials;
CREATE POLICY "Staff can view all study materials in coaching"
ON study_materials FOR SELECT
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_staff()
);

-- 2. Allow staff to insert study materials for their coaching
DROP POLICY IF EXISTS "Staff can insert study materials" ON study_materials;
CREATE POLICY "Staff can insert study materials"
ON study_materials FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.is_staff()
);

-- 3. Allow staff to update study materials in their coaching
DROP POLICY IF EXISTS "Staff can update study materials" ON study_materials;
CREATE POLICY "Staff can update study materials"
ON study_materials FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_staff()
);

-- 4. Allow staff to delete study materials in their coaching
DROP POLICY IF EXISTS "Staff can delete study materials" ON study_materials;
CREATE POLICY "Staff can delete study materials"
ON study_materials FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_staff()
);

-- Ensure RLS is enabled (it should be, but let's be sure)
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- Reload schema for PostgREST
NOTIFY pgrst, 'reload schema';
