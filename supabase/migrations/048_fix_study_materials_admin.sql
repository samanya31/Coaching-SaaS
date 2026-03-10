-- 048_fix_study_materials_admin.sql
-- Fixes study_materials RLS to explicitly support the 'admin' role along with 'coaching_admin' and 'teacher'.
-- This mirrors the approach in 009_fix_all_rls.sql to avoid globally breaking custom 'admin' roles.

BEGIN;

-- 1. Drop existing policies that rely on the overly-restrictive is_staff() function
DROP POLICY IF EXISTS "Staff can insert study materials" ON study_materials;
DROP POLICY IF EXISTS "Staff can update study materials" ON study_materials;
DROP POLICY IF EXISTS "Staff can delete study materials" ON study_materials;

-- Note: We intentionally leave "Staff can view all study materials in coaching" as-is or handled by relax_rls.sql,
-- but just to be completely safe, we update the SELECT policy as well.
DROP POLICY IF EXISTS "Staff can view all study materials in coaching" ON study_materials;

-- 2. Create exact explicit policies matching `courses` and `batches`

-- View
CREATE POLICY "Teachers and Admins can view study materials"
ON study_materials FOR SELECT TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher', 'super_admin')
);

-- Insert
CREATE POLICY "Teachers and Admins can insert study materials"
ON study_materials FOR INSERT TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher', 'super_admin')
);

-- Update
CREATE POLICY "Teachers and Admins can update study materials"
ON study_materials FOR UPDATE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher', 'super_admin')
);

-- Delete
CREATE POLICY "Admins can delete study materials"
ON study_materials FOR DELETE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'super_admin')
);

COMMIT;
