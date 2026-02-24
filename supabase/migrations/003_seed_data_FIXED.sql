-- =====================================================
-- PHASE 2: SEED DATA - 3 Coaching Institutes
-- =====================================================
-- Date: February 11, 2026
-- Purpose: Create test data for multi-tenancy verification
-- Note: Does NOT seed users (requires real Supabase Auth)
-- =====================================================

-- =====================================================
-- COACHING INSTITUTES
-- =====================================================

INSERT INTO coachings (slug, name, subdomain, primary_color, secondary_color, template_id, plan, status)
VALUES
-- Coaching 1: Demo Coaching Academy
('demo-coaching', 'Demo Coaching Academy', 'demo', '#4F46E5', '#7C3AED', 'default', 'pro', 'active'),

-- Coaching 2: ABC Test Academy
('abc-coaching', 'ABC Test Academy', 'abc', '#3B82F6', '#1E40AF', 'modern', 'basic', 'active'),

-- Coaching 3: XYZ Coaching Center  
('xyz-coaching', 'XYZ Coaching Center', 'xyz', '#10B981', '#059669', 'minimal', 'free', 'active');

-- =====================================================
-- BATCHES
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

    -- Demo Coaching Batches
    INSERT INTO batches (coaching_id, name, description, exam_goal, start_date, max_students, fee_amount, status)
    VALUES 
    (demo_id, 'JEE 2025 Batch', 'Comprehensive JEE preparation', 'JEE', '2025-01-15', 30, 50000.00, 'active'),
    (demo_id, 'NEET 2025 Batch', 'Medical entrance preparation', 'NEET', '2025-02-01', 25, 45000.00, 'active');
    
    -- ABC Coaching Batches
    INSERT INTO batches (coaching_id, name, description, exam_goal, start_date, max_students, fee_amount, status)
    VALUES 
    (abc_id, 'CA Foundation Batch', 'Chartered Accountant foundation course', 'CA', '2025-03-01', 40, 35000.00, 'active'),
    (abc_id, 'IIT-JEE Advanced', 'Advanced IIT-JEE preparation', 'IIT-JEE', '2025-01-20', 20, 60000.00, 'active');
    
    -- XYZ Coaching Batches
    INSERT INTO batches (coaching_id, name, description, exam_goal, start_date, max_students, fee_amount, status)
    VALUES 
    (xyz_id, 'UPSC Prelims 2025', 'Civil services preliminary exam', 'UPSC', '2025-04-01', 50, 40000.00, 'active'),
    (xyz_id, 'GATE 2026 Batch', 'Graduate Aptitude Test preparation', 'GATE', '2025-05-01', 35, 30000.00, 'active');

END $$;

-- =====================================================
-- COURSES
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

    -- Demo Coaching Courses
    INSERT INTO courses (coaching_id, title, description, category, exam_goal, duration_hours, is_free, price, status)
    VALUES 
    (demo_id, 'Physics Fundamentals', 'Complete physics course for JEE', 'Science', 'JEE', 120, false, 5000.00, 'published'),
    (demo_id, 'Mathematics Mastery', 'Advanced mathematics for competitive exams', 'Mathematics', 'JEE', 150, false, 6000.00, 'published'),
    (demo_id, 'Biology Basics', 'Foundation course for NEET aspirants', 'Biology', 'NEET', 100, true, 0.00, 'published');
    
    -- ABC Coaching Courses
    INSERT INTO courses (coaching_id, title, description, category, exam_goal, duration_hours, is_free, price, status)
    VALUES 
    (abc_id, 'Accounting Principles', 'Basic accounting for CA foundation', 'Commerce', 'CA', 80, false, 4000.00, 'published'),
    (abc_id, 'Business Laws', 'Legal framework for CA students', 'Law', 'CA', 60, false, 3500.00, 'published');
    
    -- XYZ Coaching Courses
    INSERT INTO courses (coaching_id, title, description, category, exam_goal, duration_hours, is_free, price, status)
    VALUES 
    (xyz_id, 'Indian Polity', 'Complete polity course for UPSC', 'Social Studies', 'UPSC', 90, false, 3000.00, 'published'),
    (xyz_id, 'Modern History', 'History from 1750s to present', 'History', 'UPSC', 70, false, 2500.00, 'published'),
    (xyz_id, 'Engineering Mathematics', 'Mathematics for GATE exam', 'Engineering', 'GATE', 100, false, 4500.00, 'published');

END $$;

-- =====================================================
-- ANNOUNCEMENTS
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

    -- Demo Coaching Announcements
    INSERT INTO announcements (coaching_id, title, content, type, is_pinned)
    VALUES 
    (demo_id, 'Welcome to Demo Coaching!', 'We are excited to have you join our JEE/NEET preparation program.', 'success', true),
    (demo_id, 'Mock Test Schedule', 'Weekly mock tests will be conducted every Saturday at 9 AM.', 'info', false);
    
    -- ABC Coaching Announcements
    INSERT INTO announcements (coaching_id, title, content, type, is_pinned)
    VALUES 
    (abc_id, 'ABC Coaching Orientation', 'Welcome to ABC Test Academy. Your success is our mission!', 'success', true),
    (abc_id, 'CA Exam Dates Released', 'Check the official website for CA Foundation exam dates.', 'warning', false);
    
    -- XYZ Coaching Announcements
    INSERT INTO announcements (coaching_id, title, content, type, is_pinned)
    VALUES 
    (xyz_id, 'XYZ Coaching Updates', 'Welcome to XYZ Coaching Center for UPSC/GATE preparation.', 'info', true),
    (xyz_id, 'Study Material Available', 'Download the latest study materials from the courses section.', 'info', false);

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify multi-tenancy works correctly

-- Check coaching institutes
SELECT id, name, slug, subdomain, plan FROM coachings ORDER BY name;

-- Check batch distribution
SELECT c.name as coaching, COUNT(b.id) as batch_count
FROM coachings c
LEFT JOIN batches b ON c.id = b.coaching_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Should show:
-- ABC Test Academy      | 2
-- Demo Coaching Academy | 2
-- XYZ Coaching Center   | 2

-- Check course distribution
SELECT c.name as coaching, COUNT(cr.id) as course_count
FROM coachings c
LEFT JOIN courses cr ON c.id = cr.coaching_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Should show:
-- ABC Test Academy      | 2
-- Demo Coaching Academy | 3
-- XYZ Coaching Center   | 3

-- =====================================================
-- SEED DATA COMPLETE (WITHOUT USERS)
-- =====================================================
-- ✅ 3 Coaching institutes created
-- ✅ 6 Batches (2 per coaching)
-- ✅ 8 Courses distributed across coachings
-- ✅ 6 Announcements
-- ❌ NO users (requires real Supabase Auth)
-- ✅ Ready for multi-tenancy testing
-- =====================================================

-- =====================================================
-- HOW TO ADD USERS (Phase 3+)
-- =====================================================
-- Users must be created via Supabase Auth, then linked:
--
-- 1. Create auth user via Supabase Dashboard or:
--    const { data } = await supabase.auth.signUp({
--      email: 'student@demo.com',
--      password: 'password'
--    })
--
-- 2. Then insert into public.users:
--    INSERT INTO users (id, coaching_id, full_name, email, role)
--    VALUES (
--      '<auth.user.id from step 1>',
--      '<coaching_id>',
--      'Student Name',
--      'student@demo.com',
--      'student'
--    );
--
-- This maintains production integrity while allowing testing.
-- =====================================================
