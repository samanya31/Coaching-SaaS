-- Migration 006: Fix Batch RLS Policies
-- Purpose: Ensure Batch creation works for both 'coaching_admin' AND 'admin' roles.
-- Also refreshes the policy to ensure it catches the user's context correctly.

BEGIN;

-- 1. Ensure RLS is enabled (just in case)
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Teachers can create batches" ON batches;
DROP POLICY IF EXISTS "Teachers can update batches" ON batches;
DROP POLICY IF EXISTS "Users can view batches in their coaching" ON batches;
DROP POLICY IF EXISTS "Admins can delete batches" ON batches;

-- 3. Re-create policies with broader role checks

-- Users can view batches in their coaching
CREATE POLICY "Users can view batches in their coaching"
ON batches FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- Teachers and Admins can create batches
-- Added 'admin' to the list of allowed roles
CREATE POLICY "Teachers and Admins can create batches"
ON batches FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

-- Teachers and Admins can update batches
CREATE POLICY "Teachers and Admins can update batches"
ON batches FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

-- Admins can delete batches
CREATE POLICY "Admins can delete batches"
ON batches FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin')
);

COMMIT;
