-- Migration 009: Fix All RLS Policies (Add 'admin' role support)
-- Purpose: Ensure 'admin' role (used by some users) has the same permissions as 'coaching_admin'.
-- previous updates only fixed 'batches'. This fixes everything else.

BEGIN;

-- =====================================================
-- 1. COURSES
-- =====================================================
DROP POLICY IF EXISTS "Teachers can create courses" ON courses;
DROP POLICY IF EXISTS "Teachers can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;

CREATE POLICY "Teachers and Admins can create courses"
ON courses FOR INSERT TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

CREATE POLICY "Teachers and Admins can update courses"
ON courses FOR UPDATE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

CREATE POLICY "Admins can delete courses"
ON courses FOR DELETE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin')
);

-- =====================================================
-- 2. COURSE CONTENT
-- =====================================================
DROP POLICY IF EXISTS "Teachers can create content" ON course_content;
DROP POLICY IF EXISTS "Teachers can update content" ON course_content;
DROP POLICY IF EXISTS "Admins can delete content" ON course_content;

CREATE POLICY "Teachers and Admins can create content"
ON course_content FOR INSERT TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

CREATE POLICY "Teachers and Admins can update content"
ON course_content FOR UPDATE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

CREATE POLICY "Admins can delete content"
ON course_content FOR DELETE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin')
);

-- =====================================================
-- 3. LIVE CLASSES
-- =====================================================
DROP POLICY IF EXISTS "Teachers can create live classes" ON live_classes;
DROP POLICY IF EXISTS "Teachers can update live classes" ON live_classes;
DROP POLICY IF EXISTS "Admins can delete live classes" ON live_classes;

CREATE POLICY "Teachers and Admins can create live classes"
ON live_classes FOR INSERT TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

CREATE POLICY "Teachers and Admins can update live classes"
ON live_classes FOR UPDATE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

CREATE POLICY "Admins can delete live classes"
ON live_classes FOR DELETE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin')
);

-- =====================================================
-- 4. ANNOUNCEMENTS
-- =====================================================
DROP POLICY IF EXISTS "Admins can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;

CREATE POLICY "Admins and Teachers can create announcements"
ON announcements FOR INSERT TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

CREATE POLICY "Admins can update announcements"
ON announcements FOR UPDATE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin')
);

CREATE POLICY "Admins can delete announcements"
ON announcements FOR DELETE TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin')
);

COMMIT;
