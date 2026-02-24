-- =====================================================
-- MIGRATION 021: DEBUG ALLOW ALL QUESTIONS & ATTEMPTS
-- =====================================================
-- Purpose: 
-- Temporarily allow ALL authenticated users to manage test questions 
-- and student attempts. This is part of the debug/permissive strategy
-- to bypass role-check issues during development.
-- =====================================================

-- 1. DROP RESTRICTIVE POLICIES ON TEST_QUESTIONS
DROP POLICY IF EXISTS "admin_manage_questions" ON test_questions;
DROP POLICY IF EXISTS "view_questions" ON test_questions;
DROP POLICY IF EXISTS "admin_modify_questions" ON test_questions;
DROP POLICY IF EXISTS "admin_delete_questions" ON test_questions;

-- 2. CREATE PERMISSIVE POLICIES FOR TEST_QUESTIONS
CREATE POLICY "debug_view_questions"
    ON test_questions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "debug_insert_questions"
    ON test_questions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "debug_modify_questions"
    ON test_questions FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "debug_delete_questions"
    ON test_questions FOR DELETE
    TO authenticated
    USING (true);

-- 3. DROP RESTRICTIVE POLICIES ON STUDENT_ATTEMPTS
DROP POLICY IF EXISTS "view_attempts" ON student_attempts;
DROP POLICY IF EXISTS "insert_attempts" ON student_attempts;
DROP POLICY IF EXISTS "update_attempts" ON student_attempts;

-- 4. CREATE PERMISSIVE POLICIES FOR STUDENT_ATTEMPTS
CREATE POLICY "debug_view_attempts"
    ON student_attempts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "debug_insert_attempts"
    ON student_attempts FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "debug_modify_attempts"
    ON student_attempts FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "debug_delete_attempts"
    ON student_attempts FOR DELETE
    TO authenticated
    USING (true);
