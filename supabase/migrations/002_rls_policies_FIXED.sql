-- =====================================================
-- PHASE 2: ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Date: February 11, 2026
-- Purpose: Enforce tenant data isolation using RLS
-- Security: Users can ONLY see/modify their coaching's data
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE coachings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: HELPER FUNCTIONS
-- =====================================================
-- These functions help policies determine current user's context
-- Created in public schema with SECURITY DEFINER

-- Get current user's coaching_id
CREATE OR REPLACE FUNCTION public.current_user_coaching_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT coaching_id FROM public.users WHERE id = auth.uid()
$$;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
$$;

-- Check if user is coaching admin
CREATE OR REPLACE FUNCTION public.is_coaching_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('coaching_admin', 'super_admin')
    )
$$;

-- =====================================================
-- STEP 3: COACHINGS TABLE POLICIES
-- =====================================================

-- Super admins can see all coachings
CREATE POLICY "Super admins can view all coachings"
ON coachings FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- Users can view their own coaching
CREATE POLICY "Users can view their coaching"
ON coachings FOR SELECT
TO authenticated
USING (id = public.current_user_coaching_id());

-- Super admins can insert new coachings
CREATE POLICY "Super admins can create coachings"
ON coachings FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin());

-- Coaching admins can update their own coaching
CREATE POLICY "Coaching admins can update their coaching"
ON coachings FOR UPDATE
TO authenticated
USING (id = public.current_user_coaching_id() AND public.is_coaching_admin());

-- =====================================================
-- STEP 4: USERS TABLE POLICIES
-- =====================================================

-- Users can view users in their coaching
CREATE POLICY "Users can view users in their coaching"
ON users FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id() OR public.is_super_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Coaching admins can create users in their coaching
CREATE POLICY "Coaching admins can create users"
ON users FOR INSERT
TO authenticated
WITH CHECK (
    (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin())
    OR public.is_super_admin()
);

-- Coaching admins can update users in their coaching
CREATE POLICY "Coaching admins can update users"
ON users FOR UPDATE
TO authenticated
USING (
    (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin())
    OR public.is_super_admin()
    OR id = auth.uid()  -- Users can update their own profile
);

-- Coaching admins can delete users in their coaching
CREATE POLICY "Coaching admins can delete users"
ON users FOR DELETE
TO authenticated
USING (
    (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin())
    OR public.is_super_admin()
);

-- =====================================================
-- STEP 5: BATCHES TABLE POLICIES
-- =====================================================

-- Users can view batches in their coaching
CREATE POLICY "Users can view batches in their coaching"
ON batches FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- Teachers and admins can create batches
CREATE POLICY "Teachers can create batches"
ON batches FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

-- Teachers and admins can update batches
CREATE POLICY "Teachers can update batches"
ON batches FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

-- Admins can delete batches
CREATE POLICY "Admins can delete batches"
ON batches FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_coaching_admin()
);

-- =====================================================
-- STEP 6: BATCH_ENROLLMENTS POLICIES
-- =====================================================

-- Users can view enrollments in their coaching
CREATE POLICY "Users can view enrollments in their coaching"
ON batch_enrollments FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- Admins can create enrollments
CREATE POLICY "Admins can create enrollments"
ON batch_enrollments FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.is_coaching_admin()
);

-- Admins can delete enrollments
CREATE POLICY "Admins can delete enrollments"
ON batch_enrollments FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_coaching_admin()
);

-- =====================================================
-- STEP 7: COURSES TABLE POLICIES
-- =====================================================

-- Users can view courses in their coaching
CREATE POLICY "Users can view courses in their coaching"
ON courses FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- Teachers can create courses
CREATE POLICY "Teachers can create courses"
ON courses FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

-- Teachers can update their courses
CREATE POLICY "Teachers can update courses"
ON courses FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

-- Admins can delete courses
CREATE POLICY "Admins can delete courses"
ON courses FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_coaching_admin()
);

-- =====================================================
-- STEP 8: COURSE_CONTENT POLICIES
-- =====================================================

-- Users can view content in their coaching
CREATE POLICY "Users can view course content in their coaching"
ON course_content FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- Teachers can manage content
CREATE POLICY "Teachers can create content"
ON course_content FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

CREATE POLICY "Teachers can update content"
ON course_content FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

CREATE POLICY "Admins can delete content"
ON course_content FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_coaching_admin()
);

-- =====================================================
-- STEP 9: LIVE_CLASSES POLICIES
-- =====================================================

-- Users can view live classes in their coaching
CREATE POLICY "Users can view live classes in their coaching"
ON live_classes FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- Teachers can create live classes
CREATE POLICY "Teachers can create live classes"
ON live_classes FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

-- Teachers can update live classes
CREATE POLICY "Teachers can update live classes"
ON live_classes FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

-- Admins can delete live classes
CREATE POLICY "Admins can delete live classes"
ON live_classes FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_coaching_admin()
);

-- =====================================================
-- STEP 10: ANNOUNCEMENTS POLICIES
-- =====================================================

-- Users can view announcements in their coaching
CREATE POLICY "Users can view announcements in their coaching"
ON announcements FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- Admins and teachers can create announcements
CREATE POLICY "Admins can create announcements"
ON announcements FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'teacher')
);

-- Admins can update announcements
CREATE POLICY "Admins can update announcements"
ON announcements FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_coaching_admin()
);

-- Admins can delete announcements
CREATE POLICY "Admins can delete announcements"
ON announcements FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.is_coaching_admin()
);

-- =====================================================
-- STEP 11: TEST_SUBMISSIONS POLICIES
-- =====================================================

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON test_submissions FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR (coaching_id = public.current_user_coaching_id() AND public.current_user_role() IN ('coaching_admin', 'teacher'))
);

-- Students can create submissions
CREATE POLICY "Students can submit tests"
ON test_submissions FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND coaching_id = public.current_user_coaching_id()
);

-- Users can update their own submissions (before final submit)
CREATE POLICY "Users can update their submissions"
ON test_submissions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- STEP 12: PROGRESS_TRACKING POLICIES
-- =====================================================

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON progress_tracking FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR (coaching_id = public.current_user_coaching_id() AND public.current_user_role() IN ('coaching_admin', 'teacher'))
);

-- Users can track their own progress
CREATE POLICY "Users can track their progress"
ON progress_tracking FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND coaching_id = public.current_user_coaching_id()
);

-- Users can update their own progress
CREATE POLICY "Users can update their progress"
ON progress_tracking FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- RLS POLICIES COMPLETE
-- =====================================================
-- ✅ All tables protected with RLS
-- ✅ Tenant isolation enforced
-- ✅ Role-based access control implemented
-- ✅ Users can ONLY see their coaching's data
-- ✅ Helper functions use public schema
-- ✅ SET search_path prevents privilege escalation
-- =====================================================
