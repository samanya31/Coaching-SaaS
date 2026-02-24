-- =====================================================
-- MIGRATION 036: ADD BATCH_ID TO TESTS
-- =====================================================
-- Purpose: Allow tests to be batch-specific or general (exam-goal level).
-- When batch_id IS NULL → test is available to all students of that exam_goal.
-- When batch_id IS NOT NULL → test is only for students enrolled in that batch.
-- =====================================================

ALTER TABLE tests ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES batches(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tests_batch_id ON tests(batch_id);
