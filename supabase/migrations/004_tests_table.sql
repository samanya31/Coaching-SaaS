-- Create tests table for mock tests, practice sets, and live quizzes
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('mock', 'practice', 'live')),
    exam_goal TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tests_coaching_id ON tests(coaching_id);
CREATE INDEX IF NOT EXISTS idx_tests_type ON tests(type);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_exam_goal ON tests(exam_goal);

-- Enable RLS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tests
CREATE POLICY "Users can view tests from their coaching"
    ON tests FOR SELECT
    USING (coaching_id IN (
        SELECT coaching_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can insert tests"
    ON tests FOR INSERT
    WITH CHECK (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update tests"
    ON tests FOR UPDATE
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can delete tests"
    ON tests FOR DELETE
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_tests_updated_at
    BEFORE UPDATE ON tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
