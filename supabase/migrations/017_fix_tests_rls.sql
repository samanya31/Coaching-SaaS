-- =====================================================
-- MIGRATION 017: FIX TESTS RLS
-- =====================================================
-- Purpose: Fix 403 Forbidden errors by simplifying RLS policies
-- and using SECURITY DEFINER functions to bypass recursion.
-- =====================================================

-- 1. Ensure helper functions exist and are SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_coaching_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT coaching_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- 2. FIX TESTS POLICIES
DROP POLICY IF EXISTS "Users can view tests from their coaching" ON tests;
DROP POLICY IF EXISTS "Admins can insert tests" ON tests;
DROP POLICY IF EXISTS "Admins can update tests" ON tests;
DROP POLICY IF EXISTS "Admins can delete tests" ON tests;

-- Allow read access to anyone in the same coaching
CREATE POLICY "view_tests"
    ON tests FOR SELECT
    USING (
       coaching_id = public.get_user_coaching_id()
    );

-- Allow admins to insert/update/delete
CREATE POLICY "admin_manage_tests"
    ON tests FOR ALL
    USING (
        public.check_is_admin() AND coaching_id = public.get_user_coaching_id()
    )
    WITH CHECK (
        public.check_is_admin() AND coaching_id = public.get_user_coaching_id()
    );

-- 3. FIX TEST_QUESTIONS POLICIES
DROP POLICY IF EXISTS "Admins can view questions" ON test_questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON test_questions;
DROP POLICY IF EXISTS "Admins can update questions" ON test_questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON test_questions;

-- Everyone in the coaching can view questions (for holding tests)
-- We join with tests table to check coaching_id
CREATE POLICY "view_questions"
    ON test_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tests t
            WHERE t.id = test_questions.test_id
            AND t.coaching_id = public.get_user_coaching_id()
        )
    );

-- Admins can manage questions
CREATE POLICY "admin_manage_questions"
    ON test_questions FOR ALL
    USING (
        public.check_is_admin() 
        AND EXISTS (
            SELECT 1 FROM tests t
            WHERE t.id = test_questions.test_id
            AND t.coaching_id = public.get_user_coaching_id()
        )
    );

-- 4. FIX STUDENT_ATTEMPTS POLICIES
DROP POLICY IF EXISTS "Students can view own attempts" ON student_attempts;
DROP POLICY IF EXISTS "Students can create attempts" ON student_attempts;
DROP POLICY IF EXISTS "Students can update own attempts" ON student_attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON student_attempts;

-- Students view their own, Admins view all in coaching
CREATE POLICY "view_attempts"
    ON student_attempts FOR SELECT
    USING (
        student_id = auth.uid()
        OR
        (public.check_is_admin() AND coaching_id = public.get_user_coaching_id())
    );

-- Students can insert their own attempts
CREATE POLICY "insert_attempts"
    ON student_attempts FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        AND coaching_id = public.get_user_coaching_id()
    );

-- Students can update their own in-progress attempts
CREATE POLICY "update_attempts"
    ON student_attempts FOR UPDATE
    USING (student_id = auth.uid());
