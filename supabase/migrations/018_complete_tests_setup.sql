-- =====================================================
-- MIGRATION 018: COMPLETE TESTS SETUP
-- =====================================================
-- Purpose: Consolidated setup for tests, questions, and attempts.
-- Ensures tables exist and applies correct RLS policies.
-- =====================================================

-- 0. HELPER FUNCTIONS
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

-- 1. TESTS TABLE
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('mock', 'practice', 'live')),
    exam_goal TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    passing_marks INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    scheduled_date TIMESTAMPTZ,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TEST_QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    marks INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. STUDENT_ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS student_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    answers JSONB DEFAULT '{}',
    score INTEGER DEFAULT 0,
    total_marks INTEGER NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
    started_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    time_taken INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(test_id, student_id, status)
);

-- 4. ENABLE RLS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attempts ENABLE ROW LEVEL SECURITY;

-- 5. TESTS POLICIES
DROP POLICY IF EXISTS "view_tests" ON tests;
DROP POLICY IF EXISTS "admin_manage_tests" ON tests;
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Users can view tests from their coaching" ON tests;
    DROP POLICY IF EXISTS "Admins can insert tests" ON tests;
    DROP POLICY IF EXISTS "Admins can update tests" ON tests;
    DROP POLICY IF EXISTS "Admins can delete tests" ON tests;

CREATE POLICY "view_tests"
    ON tests FOR SELECT
    USING (coaching_id = public.get_user_coaching_id());

CREATE POLICY "admin_manage_tests"
    ON tests FOR ALL
    USING (public.check_is_admin() AND coaching_id = public.get_user_coaching_id())
    WITH CHECK (public.check_is_admin() AND coaching_id = public.get_user_coaching_id());

-- 6. QUESTIONS POLICIES
DROP POLICY IF EXISTS "view_questions" ON test_questions;
DROP POLICY IF EXISTS "admin_manage_questions" ON test_questions;
    -- Drop old policies
    DROP POLICY IF EXISTS "Admins can view questions" ON test_questions;
    DROP POLICY IF EXISTS "Admins can insert questions" ON test_questions;
    DROP POLICY IF EXISTS "Admins can update questions" ON test_questions;
    DROP POLICY IF EXISTS "Admins can delete questions" ON test_questions;

CREATE POLICY "view_questions"
    ON test_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tests t
            WHERE t.id = test_questions.test_id
            AND t.coaching_id = public.get_user_coaching_id()
        )
    );

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

-- 7. ATTEMPTS POLICIES
DROP POLICY IF EXISTS "view_attempts" ON student_attempts;
DROP POLICY IF EXISTS "insert_attempts" ON student_attempts;
DROP POLICY IF EXISTS "update_attempts" ON student_attempts;
    -- Drop old policies
    DROP POLICY IF EXISTS "Students can view own attempts" ON student_attempts;
    DROP POLICY IF EXISTS "Students can create attempts" ON student_attempts;
    DROP POLICY IF EXISTS "Students can update own attempts" ON student_attempts;
    DROP POLICY IF EXISTS "Admins can view all attempts" ON student_attempts;

CREATE POLICY "view_attempts"
    ON student_attempts FOR SELECT
    USING (
        student_id = auth.uid()
        OR
        (public.check_is_admin() AND coaching_id = public.get_user_coaching_id())
    );

CREATE POLICY "insert_attempts"
    ON student_attempts FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        AND coaching_id = public.get_user_coaching_id()
    );

CREATE POLICY "update_attempts"
    ON student_attempts FOR UPDATE
    USING (student_id = auth.uid());

-- 8. GRANT PERMISSIONS
GRANT ALL ON tests TO authenticated;
GRANT ALL ON test_questions TO authenticated;
GRANT ALL ON student_attempts TO authenticated;

-- 9. TRIGGERS (Safe creation)
CREATE OR REPLACE FUNCTION calculate_attempt_score()
RETURNS TRIGGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_total_marks INTEGER := 0;
    v_question RECORD;
    v_student_answer TEXT;
BEGIN
    IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
        IF NEW.submitted_at IS NULL THEN
            NEW.submitted_at := now();
        END IF;
        
        FOR v_question IN 
            SELECT id, correct_option, marks 
            FROM test_questions 
            WHERE test_id = NEW.test_id
        LOOP
            v_total_marks := v_total_marks + v_question.marks;
            v_student_answer := NEW.answers->>v_question.id::text;
            IF v_student_answer = v_question.correct_option THEN
                v_score := v_score + v_question.marks;
            END IF;
        END LOOP;
        
        NEW.score := v_score;
        NEW.total_marks := v_total_marks;
        IF v_total_marks > 0 THEN
            NEW.percentage := (v_score::DECIMAL / v_total_marks::DECIMAL) * 100;
        ELSE
            NEW.percentage := 0;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_calculate_score ON student_attempts;
CREATE TRIGGER auto_calculate_score
    BEFORE INSERT OR UPDATE ON student_attempts
    FOR EACH ROW
    EXECUTE FUNCTION calculate_attempt_score();
