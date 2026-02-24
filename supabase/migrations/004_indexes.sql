-- =====================================================
-- MIGRATION 004: PERFORMANCE INDEXES (Hardened)
-- =====================================================
-- Date: February 12, 2026
-- Purpose: Optimize common RLS and filtering queries
-- Improvements: Composite indexes for (coaching_id, status)
-- =====================================================

-- 1. BATCHES
CREATE INDEX IF NOT EXISTS idx_batches_coaching_status 
ON batches(coaching_id, status);

-- 2. COURSES
CREATE INDEX IF NOT EXISTS idx_courses_coaching_status 
ON courses(coaching_id, status);

-- 3. LIVE CLASSES
CREATE INDEX IF NOT EXISTS idx_live_classes_coaching_status 
ON live_classes(coaching_id, status);

-- 4. ANNOUNCEMENTS
CREATE INDEX IF NOT EXISTS idx_announcements_coaching_type 
ON announcements(coaching_id, type);

-- 5. COURSE CONTENT
CREATE INDEX IF NOT EXISTS idx_content_coaching_course 
ON course_content(coaching_id, course_id);

-- 6. USERS
-- Optimizes "Find student in my coaching"
CREATE INDEX IF NOT EXISTS idx_users_coaching_role 
ON users(coaching_id, role);

-- 7. PROGRESS TRACKING
-- Optimizes "Get my progress for this course"
CREATE INDEX IF NOT EXISTS idx_progress_user_content 
ON progress_tracking(user_id, content_id);

-- 8. TEST SUBMISSIONS
-- Optimizes "Get my submission for this test"
CREATE INDEX IF NOT EXISTS idx_submissions_user_content 
ON test_submissions(user_id, content_id);
