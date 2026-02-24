-- =====================================================
-- MIGRATION 005: DEVELOPMENT SEED DATA (Safe)
-- =====================================================
-- Date: February 12, 2026
-- Purpose: Seed data for development/testing ONLY
-- Safety: Looks up existing Auth Users (Does NOT generate random UUIDs)
-- =====================================================

DO $$
DECLARE
    -- Coaching IDs
    demo_id UUID;
    abc_id UUID;
    xyz_id UUID;
    
    -- User IDs (fetched from auth.users)
    demo_admin_id UUID;
    demo_teacher_id UUID;
    demo_student_id UUID;
    abc_admin_id UUID;
    xyz_admin_id UUID;
BEGIN

    -- 1. UPSERT COACHINGS
    INSERT INTO coachings (slug, name, subdomain, primary_color, secondary_color, template_id, plan, status)
    VALUES
        ('demo-coaching', 'Demo Coaching Academy', 'demo', '#4F46E5', '#7C3AED', 'default', 'pro', 'active'),
        ('abc-coaching', 'ABC Test Academy', 'abc', '#3B82F6', '#1E40AF', 'modern', 'basic', 'active'),
        ('xyz-coaching', 'XYZ Coaching Center', 'xyz', '#10B981', '#059669', 'minimal', 'free', 'active')
    ON CONFLICT (slug) DO UPDATE SET status = 'active';

    -- Get Coaching IDs
    SELECT id INTO demo_id FROM coachings WHERE slug = 'demo-coaching';
    SELECT id INTO abc_id FROM coachings WHERE slug = 'abc-coaching';
    SELECT id INTO xyz_id FROM coachings WHERE slug = 'xyz-coaching';

    -- 2. LINK EXISTING AUTH USERS (If they exist)
    
    -- Demo Admin (admin@demo.com)
    SELECT id INTO demo_admin_id FROM auth.users WHERE email = 'admin@demo.com';
    IF demo_admin_id IS NOT NULL THEN
        INSERT INTO public.users (id, coaching_id, full_name, email, role, status)
        VALUES (demo_admin_id, demo_id, 'Demo Admin', 'admin@demo.com', 'coaching_admin', 'active')
        ON CONFLICT (id) DO UPDATE SET coaching_id = demo_id, role = 'coaching_admin';
    END IF;

    -- Demo Teacher (sharma@demo.com)
    SELECT id INTO demo_teacher_id FROM auth.users WHERE email = 'sharma@demo.com';
    IF demo_teacher_id IS NOT NULL THEN
        INSERT INTO public.users (id, coaching_id, full_name, email, role, specialization, status)
        VALUES (demo_teacher_id, demo_id, 'Prof. Sharma', 'sharma@demo.com', 'teacher', ARRAY['Physics'], 'active')
        ON CONFLICT (id) DO UPDATE SET coaching_id = demo_id;
    END IF;

    -- ABC Admin (admin@abc.com)
    SELECT id INTO abc_admin_id FROM auth.users WHERE email = 'admin@abc.com';
    IF abc_admin_id IS NOT NULL THEN
        INSERT INTO public.users (id, coaching_id, full_name, email, role, status)
        VALUES (abc_admin_id, abc_id, 'ABC Admin', 'admin@abc.com', 'coaching_admin', 'active')
        ON CONFLICT (id) DO UPDATE SET coaching_id = abc_id;
    END IF;

    -- XYZ Admin (admin@xyz.com)
    SELECT id INTO xyz_admin_id FROM auth.users WHERE email = 'admin@xyz.com';
    IF xyz_admin_id IS NOT NULL THEN
        INSERT INTO public.users (id, coaching_id, full_name, email, role, status)
        VALUES (xyz_admin_id, xyz_id, 'XYZ Admin', 'admin@xyz.com', 'coaching_admin', 'active')
        ON CONFLICT (id) DO UPDATE SET coaching_id = xyz_id;
    END IF;

    -- 3. SEED CONTENT (Batches, Courses, etc.)
    -- Only creating if coachings exist
    
    IF demo_id IS NOT NULL THEN
        -- Batches
        INSERT INTO batches (coaching_id, name, description, exam_goal, start_date, max_students, fee_amount, status)
        SELECT demo_id, 'JEE 2025 Batch', 'Comprehensive JEE prep', 'JEE', '2025-01-15', 30, 50000, 'active'
        WHERE NOT EXISTS (SELECT 1 FROM batches WHERE coaching_id = demo_id AND name = 'JEE 2025 Batch');

        -- Courses
        INSERT INTO courses (coaching_id, title, description, category, exam_goal, status)
        SELECT demo_id, 'Physics Fundamentals', 'Complete physics', 'Science', 'JEE', 'published'
        WHERE NOT EXISTS (SELECT 1 FROM courses WHERE coaching_id = demo_id AND title = 'Physics Fundamentals');
        
        -- Announcements
        INSERT INTO announcements (coaching_id, title, content, type, is_pinned)
        SELECT demo_id, 'Welcome!', 'Welcome to Demo Coaching', 'success', true
        WHERE NOT EXISTS (SELECT 1 FROM announcements WHERE coaching_id = demo_id AND title = 'Welcome!');
    END IF;

    IF abc_id IS NOT NULL THEN
        INSERT INTO batches (coaching_id, name, description, exam_goal, start_date, max_students, fee_amount, status)
        SELECT abc_id, 'CA Foundation', 'Start your CA journey', 'CA', '2025-03-01', 40, 35000, 'active'
        WHERE NOT EXISTS (SELECT 1 FROM batches WHERE coaching_id = abc_id AND name = 'CA Foundation');
    END IF;

END $$;
