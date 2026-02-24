-- =====================================================
-- MIGRATION 016: TEST QUESTIONS AND ATTEMPTS
-- =====================================================
-- Purpose: Add MCQ questions and student attempts tracking
-- =====================================================

-- 1. CREATE TEST_QUESTIONS TABLE
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_display_order ON test_questions(test_id, display_order);

-- 2. CREATE STUDENT_ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS student_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    
    -- Attempt data
    answers JSONB DEFAULT '{}', -- {"question_id": "A", "question_id_2": "B"}
    score INTEGER DEFAULT 0,
    total_marks INTEGER NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
    started_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    time_taken INTEGER, -- in seconds
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure one active attempt per student per test
    UNIQUE(test_id, student_id, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_attempts_test_id ON student_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_student_id ON student_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_status ON student_attempts(status);
CREATE INDEX IF NOT EXISTS idx_student_attempts_coaching_id ON student_attempts(coaching_id);

-- 3. ADD TRIGGERS
CREATE TRIGGER update_test_questions_updated_at
    BEFORE UPDATE ON test_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_attempts_updated_at
    BEFORE UPDATE ON student_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. ENABLE RLS
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attempts ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR TEST_QUESTIONS

-- Admins can manage questions
CREATE POLICY "Admins can view questions"
    ON test_questions FOR SELECT
    TO authenticated
    USING (
        test_id IN (
            SELECT id FROM tests 
            WHERE coaching_id IN (
                SELECT coaching_id FROM users 
                WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can insert questions"
    ON test_questions FOR INSERT
    TO authenticated
    WITH CHECK (
        test_id IN (
            SELECT id FROM tests 
            WHERE coaching_id IN (
                SELECT coaching_id FROM users 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        )
    );

CREATE POLICY "Admins can update questions"
    ON test_questions FOR UPDATE
    TO authenticated
    USING (
        test_id IN (
            SELECT id FROM tests 
            WHERE coaching_id IN (
                SELECT coaching_id FROM users 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        )
    );

CREATE POLICY "Admins can delete questions"
    ON test_questions FOR DELETE
    TO authenticated
    USING (
        test_id IN (
            SELECT id FROM tests 
            WHERE coaching_id IN (
                SELECT coaching_id FROM users 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'super_admin')
            )
        )
    );

-- 6. RLS POLICIES FOR STUDENT_ATTEMPTS

-- Students can view their own attempts
CREATE POLICY "Students can view own attempts"
    ON student_attempts FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid() 
        OR 
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Students can create their own attempts
CREATE POLICY "Students can create attempts"
    ON student_attempts FOR INSERT
    TO authenticated
    WITH CHECK (student_id = auth.uid());

-- Students can update their own in-progress attempts
CREATE POLICY "Students can update own attempts"
    ON student_attempts FOR UPDATE
    TO authenticated
    USING (student_id = auth.uid() AND status = 'in_progress');

-- Admins can view all attempts
CREATE POLICY "Admins can view all attempts"
    ON student_attempts FOR SELECT
    TO authenticated
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 7. GRANT PERMISSIONS
GRANT ALL ON test_questions TO authenticated;
GRANT ALL ON student_attempts TO authenticated;

-- 8. HELPER FUNCTION: Auto-calculate score when attempt is submitted
CREATE OR REPLACE FUNCTION calculate_attempt_score()
RETURNS TRIGGER AS $$
DECLARE
    v_score INTEGER := 0;
    v_total_marks INTEGER := 0;
    v_question RECORD;
    v_student_answer TEXT;
BEGIN
    -- Only calculate if status changed to 'submitted'
    IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status != 'submitted') THEN
        -- Set submitted_at if not already set
        IF NEW.submitted_at IS NULL THEN
            NEW.submitted_at := now();
        END IF;
        
        -- Calculate score by comparing answers
        FOR v_question IN 
            SELECT id, correct_option, marks 
            FROM test_questions 
            WHERE test_id = NEW.test_id
        LOOP
            v_total_marks := v_total_marks + v_question.marks;
            
            -- Get student's answer for this question
            v_student_answer := NEW.answers->>v_question.id::text;
            
            -- Check if correct
            IF v_student_answer = v_question.correct_option THEN
                v_score := v_score + v_question.marks;
            END IF;
        END LOOP;
        
        -- Update score and percentage
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

-- Add trigger to auto-calculate score
CREATE TRIGGER auto_calculate_score
    BEFORE INSERT OR UPDATE ON student_attempts
    FOR EACH ROW
    EXECUTE FUNCTION calculate_attempt_score();
