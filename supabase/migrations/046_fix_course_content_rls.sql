-- Migration 046: Fix Content & Live Class RLS Policies
-- Purpose: Resolve 403 Forbidden errors across courses, content, and live classes
-- Consistency: Uses public.is_staff() and public.current_user_coaching_id()

BEGIN;

-- =============================================
-- 1. FIX course_content TABLE
-- =============================================
DROP POLICY IF EXISTS "Users can view course content in their coaching" ON course_content;
DROP POLICY IF EXISTS "Teachers can create content" ON course_content;
DROP POLICY IF EXISTS "Teachers can update content" ON course_content;
DROP POLICY IF EXISTS "Admins can delete content" ON course_content;
DROP POLICY IF EXISTS "Enable all access for admins" ON course_content;

CREATE POLICY "Staff can manage course content"
ON course_content FOR ALL
TO authenticated
USING (
    (coaching_id = public.current_user_coaching_id() AND public.is_staff())
    OR public.is_super_admin()
)
WITH CHECK (
    (coaching_id = public.current_user_coaching_id() AND public.is_staff())
    OR public.is_super_admin()
);

CREATE POLICY "Students can view course content"
ON course_content FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- =============================================
-- 2. FIX courses TABLE
-- =============================================
DROP POLICY IF EXISTS "Users can view courses in their coaching" ON courses;
DROP POLICY IF EXISTS "Teachers can create courses" ON courses;
DROP POLICY IF EXISTS "Teachers can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
DROP POLICY IF EXISTS "Enable all access for admins" ON courses;

CREATE POLICY "Staff can manage courses"
ON courses FOR ALL
TO authenticated
USING (
    (coaching_id = public.current_user_coaching_id() AND public.is_staff())
    OR public.is_super_admin()
)
WITH CHECK (
    (coaching_id = public.current_user_coaching_id() AND public.is_staff())
    OR public.is_super_admin()
);

CREATE POLICY "Students can view courses"
ON courses FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- =============================================
-- 3. FIX live_classes TABLE
-- =============================================
DROP POLICY IF EXISTS "Users can view live classes in their coaching" ON live_classes;
DROP POLICY IF EXISTS "Teachers can create live classes" ON live_classes;
DROP POLICY IF EXISTS "Teachers can update live classes" ON live_classes;
DROP POLICY IF EXISTS "Admins can delete live classes" ON live_classes;
DROP POLICY IF EXISTS "Enable all access for admins" ON live_classes;

CREATE POLICY "Staff can manage live classes"
ON live_classes FOR ALL
TO authenticated
USING (
    (coaching_id = public.current_user_coaching_id() AND public.is_staff())
    OR public.is_super_admin()
)
WITH CHECK (
    (coaching_id = public.current_user_coaching_id() AND public.is_staff())
    OR public.is_super_admin()
);

CREATE POLICY "Students can view live classes"
ON live_classes FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

COMMIT;
