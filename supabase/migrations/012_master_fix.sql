-- Migration 012: Master Fix for Schema and Permissions
-- Purpose: Resolve all 400/403 errors by ensuring all columns exist and permissions are correct.
-- Combines fixes from 003, 009, 010, and 011.

BEGIN;

-- =====================================================
-- 1. FIX COURSES TABLE
-- =====================================================
DO $$
BEGIN
    -- Add batch_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'batch_id') THEN
        ALTER TABLE courses ADD COLUMN batch_id UUID REFERENCES batches(id) ON DELETE SET NULL;
    END IF;

    -- Add metadata if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'metadata') THEN
        ALTER TABLE courses ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- =====================================================
-- 2. FIX COURSE_CONTENT TABLE
-- =====================================================
DO $$
BEGIN
    -- Add metadata if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_content' AND column_name = 'metadata') THEN
        ALTER TABLE course_content ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- =====================================================
-- 3. FIX LIVE_CLASSES TABLE
-- =====================================================
DO $$
BEGIN
    -- Add batch_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_classes' AND column_name = 'batch_id') THEN
        ALTER TABLE live_classes ADD COLUMN batch_id UUID REFERENCES batches(id) ON DELETE SET NULL;
    END IF;

    -- Add instructor (text) if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_classes' AND column_name = 'instructor') THEN
        ALTER TABLE live_classes ADD COLUMN instructor TEXT;
    END IF;
END $$;

-- Make instructor_id optional
ALTER TABLE live_classes ALTER COLUMN instructor_id DROP NOT NULL;

-- =====================================================
-- 4. RE-APPLY RLS POLICIES (Just to be safe)
-- =====================================================

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;

-- 4.1 Courses Policies
DROP POLICY IF EXISTS "Enable all access for admins" ON courses;
CREATE POLICY "Enable all access for admins" ON courses FOR ALL TO authenticated USING (
    public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
) WITH CHECK (
    public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

-- 4.2 Course Content Policies
DROP POLICY IF EXISTS "Enable all access for admins" ON course_content;
CREATE POLICY "Enable all access for admins" ON course_content FOR ALL TO authenticated USING (
    public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
) WITH CHECK (
    public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

-- 4.3 Live Classes Policies
DROP POLICY IF EXISTS "Enable all access for admins" ON live_classes;
CREATE POLICY "Enable all access for admins" ON live_classes FOR ALL TO authenticated USING (
    public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
) WITH CHECK (
    public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

COMMIT;
