-- =====================================================
-- PHASE 2: SEED DATA - 3 Coaching Institutes (IDEMPOTENT & SAFE)
-- =====================================================
-- Date: February 12, 2026
-- Purpose: Create test data safely (Production Ready)
-- Coachings: Demo, ABC, XYZ
-- Notes: This script is SAFE to run multiple times.
-- =====================================================

-- =====================================================
-- 1. COACHING INSTITUTES
-- =====================================================
INSERT INTO coachings (slug, name, subdomain, primary_color, secondary_color, template_id, plan, status)
VALUES
    ('demo-coaching', 'Demo Coaching Academy', 'demo', '#4F46E5', '#7C3AED', 'default', 'pro', 'active'),
    ('abc-coaching', 'ABC Test Academy', 'abc', '#3B82F6', '#1E40AF', 'modern', 'basic', 'active'),
    ('xyz-coaching', 'XYZ Coaching Center', 'xyz', '#10B981', '#059669', 'minimal', 'free', 'active')
ON CONFLICT (slug) DO UPDATE 
SET status = 'active'; -- Ensure they are active if they exist

-- =====================================================
-- 2. USERS (Safe Insertion)
-- =====================================================
DO $$
DECLARE
    demo_id UUID;
    abc_id UUID;
    xyz_id UUID;
BEGIN
    -- Get IDs dynamically (Never hardcode UUIDs)
    SELECT id INTO demo_id FROM coachings WHERE slug = 'demo-coaching';
    SELECT id INTO abc_id FROM coachings WHERE slug = 'abc-coaching';
    SELECT id INTO xyz_id FROM coachings WHERE slug = 'xyz-coaching';

    -- Demo Users (Check if email exists before inserting)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@demo.com') THEN
        INSERT INTO users (id, coaching_id, full_name, email, role, status)
        VALUES (gen_random_uuid(), demo_id, 'Demo Admin', 'admin@demo.com', 'coaching_admin', 'active');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sharma@demo.com') THEN
        INSERT INTO users (id, coaching_id, full_name, email, role, specialization, status)
        VALUES (gen_random_uuid(), demo_id, 'Prof. Sharma', 'sharma@demo.com', 'teacher', ARRAY['Physics', 'Mathematics'], 'active');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'john@demo.com') THEN
        INSERT INTO users (id, coaching_id, full_name, email, role, student_id, exam_goal, status)
        VALUES (gen_random_uuid(), demo_id, 'John Doe', 'john@demo.com', 'student', 'DEMO001', 'JEE', 'active');
    END IF;

    -- ABC Users
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@abc.com') THEN
        INSERT INTO users (id, coaching_id, full_name, email, role, status)
        VALUES (gen_random_uuid(), abc_id, 'ABC Admin', 'admin@abc.com', 'coaching_admin', 'active');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'alice@abc.com') THEN
        INSERT INTO users (id, coaching_id, full_name, email, role, student_id, exam_goal, status)
        VALUES (gen_random_uuid(), abc_id, 'Alice Brown', 'alice@abc.com', 'student', 'ABC001', 'CA', 'active');
    END IF;

    -- XYZ Users
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@xyz.com') THEN
        INSERT INTO users (id, coaching_id, full_name, email, role, status)
        VALUES (gen_random_uuid(), xyz_id, 'XYZ Admin', 'admin@xyz.com', 'coaching_admin', 'active');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'charlie@xyz.com') THEN
        INSERT INTO users (id, coaching_id, full_name, email, role, student_id, exam_goal, status)
        VALUES (gen_random_uuid(), xyz_id, 'Charlie Davis', 'charlie@xyz.com', 'student', 'XYZ001', 'UPSC', 'active');
    END IF;

END $$;

-- =====================================================
-- 3. BATCHES, COURSES, ANNOUNCEMENTS (Safe Insertion)
-- =====================================================
DO $$
DECLARE
    demo_id UUID;
    abc_id UUID;
    xyz_id UUID;
BEGIN
    SELECT id INTO demo_id FROM coachings WHERE slug = 'demo-coaching';
    SELECT id INTO abc_id FROM coachings WHERE slug = 'abc-coaching';
    SELECT id INTO xyz_id FROM coachings WHERE slug = 'xyz-coaching';

    -- Batches (Use Name + CoachingID as unique check logic)
    INSERT INTO batches (coaching_id, name, description, exam_goal, start_date, max_students, fee_amount, status)
    SELECT demo_id, 'JEE 2025 Batch', 'Comprehensive JEE preparation', 'JEE', '2025-01-15', 30, 50000.00, 'active'
    WHERE NOT EXISTS (SELECT 1 FROM batches WHERE coaching_id = demo_id AND name = 'JEE 2025 Batch');

    INSERT INTO batches (coaching_id, name, description, exam_goal, start_date, max_students, fee_amount, status)
    SELECT abc_id, 'CA Foundation Batch', 'Chartered Accountant foundation', 'CA', '2025-03-01', 40, 35000.00, 'active'
    WHERE NOT EXISTS (SELECT 1 FROM batches WHERE coaching_id = abc_id AND name = 'CA Foundation Batch');

    -- Courses
    INSERT INTO courses (coaching_id, title, description, category, exam_goal, duration_hours, is_free, price, status)
    SELECT demo_id, 'Physics Fundamentals', 'Complete physics course', 'Science', 'JEE', 120, false, 5000.00, 'published'
    WHERE NOT EXISTS (SELECT 1 FROM courses WHERE coaching_id = demo_id AND title = 'Physics Fundamentals');

    -- Announcements
    INSERT INTO announcements (coaching_id, title, content, type, is_pinned)
    SELECT demo_id, 'Welcome to Demo Coaching!', 'Excited to have you!', 'success', true
    WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE coaching_id = demo_id AND title = 'Welcome to Demo Coaching!');

END $$;
