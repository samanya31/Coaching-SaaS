-- =====================================================
-- FIX MIGRATION: RELAX ATTEMPT CONSTRAINTS
-- =====================================================
-- Purpose: Fix 409 Conflict when submitting a test.
-- The existing UNIQUE constraint (test_id, student_id, status) prevents
-- a student from having multiple "submitted" attempts (retakes).
-- It also causes issues if an "in_progress" attempt is updated to "submitted"
-- when a "submitted" one already exists.
--
-- We will:
-- 1. Drop the strict constraint.
-- 2. Add a partial unique index to enforce ONLY ONE "in_progress" attempt at a time.
--    This ensures the "Resume" logic works, but allows unlimited "submitted" history.
-- =====================================================

-- 1. Drop the problematic constraint
ALTER TABLE student_attempts
DROP CONSTRAINT IF EXISTS student_attempts_test_id_student_id_status_key;

-- 2. Add partial unique index for 'in_progress'
-- This ensures a student can't accidentally start 2 parallel attempts for the same test.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_attempt_per_student 
ON student_attempts (test_id, student_id) 
WHERE status = 'in_progress';

-- 3. (Optional) Cleanup any duplicate 'in_progress' attempts if they exist?
-- We assume the previous logic blocked them, so we should be fine.
