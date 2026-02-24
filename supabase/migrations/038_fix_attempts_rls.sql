-- =====================================================
-- FIX MIGRATION: RELAX STUDENT ATTEMPTS RLS
-- =====================================================
-- Purpose: content is failing to load for students.
-- Previous RLS policies for student_attempts were also strict about coaching_id.
-- We should simplify this: a student should always be able to see/edit their own attempts.
-- =====================================================

-- 1. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "view_attempts" ON student_attempts;
DROP POLICY IF EXISTS "insert_attempts" ON student_attempts;
DROP POLICY IF EXISTS "update_attempts" ON student_attempts;
DROP POLICY IF EXISTS "Students can view own attempts" ON student_attempts;
DROP POLICY IF EXISTS "Students can create attempts" ON student_attempts;
DROP POLICY IF EXISTS "Students can update own attempts" ON student_attempts;

-- 2. CREATE NEW SIMPLIFIED POLICIES

-- VIEW: Student sees own attempts, Admins see attempts for their coaching
CREATE POLICY "view_attempts"
    ON student_attempts FOR SELECT
    USING (
        student_id = auth.uid()
        OR
        (public.check_is_admin() AND coaching_id = public.get_user_coaching_id())
    );

-- INSERT: Student can insert attempts for themselves
-- We don't strictly enforce coaching_id here to avoid issues if frontend misses it
-- The trigger or backend logic should handle assigning standard values if needed,
-- but for now, trusting auth.uid() is the most critical part.
CREATE POLICY "insert_attempts"
    ON student_attempts FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
    );

-- UPDATE: Student can update their own attempts (e.g., submitting answers)
CREATE POLICY "update_attempts"
    ON student_attempts FOR UPDATE
    USING (student_id = auth.uid());
