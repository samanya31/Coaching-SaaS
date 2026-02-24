-- =====================================================
-- PHASE 2: ROW-LEVEL SECURITY (RLS) POLICIES (SAFE & IDEMPOTENT)
-- =====================================================
-- Date: February 12, 2026
-- Purpose: Enforce tenant data isolation using RLS
-- Security: Users can ONLY see/modify their coaching's data
-- Notes: This script is SAFE to run multiple times.
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE coachings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. HELPER FUNCTIONS (Safe Creation)
-- =====================================================

-- Get current user's coaching_id
CREATE OR REPLACE FUNCTION public.current_user_coaching_id()
RETURNS UUID AS $$
    SELECT coaching_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is coaching admin
CREATE OR REPLACE FUNCTION public.is_coaching_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('coaching_admin', 'super_admin')
    )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =====================================================
-- 3. COACHINGS TABLE POLICIES (Safe Creation)
-- =====================================================

-- CRITICAL: Allow anonymous users to look up ACTIVE tenants
-- This is required for the TenantProvider to work before login
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'coachings' AND policyname = 'Allow anonymous read access to active coachings'
    ) THEN
        CREATE POLICY "Allow anonymous read access to active coachings"
        ON coachings FOR SELECT
        TO anon
        USING (status = 'active');
    END IF;
END $$;

-- Super admins can see all coachings
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'coachings' AND policyname = 'Super admins can view all coachings'
    ) THEN
        CREATE POLICY "Super admins can view all coachings"
        ON coachings FOR SELECT
        TO authenticated
        USING (auth.is_super_admin());
    END IF;
END $$;

-- Users can view their own coaching
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'coachings' AND policyname = 'Users can view their coaching'
    ) THEN
        CREATE POLICY "Users can view their coaching"
        ON coachings FOR SELECT
        TO authenticated
        USING (id = auth.current_user_coaching_id());
    END IF;
END $$;

-- =====================================================
-- 4. USERS TABLE POLICIES (Safe Creation)
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view users in their coaching') THEN
        CREATE POLICY "Users can view users in their coaching"
        ON users FOR SELECT
        TO authenticated
        USING (coaching_id = auth.current_user_coaching_id() OR auth.is_super_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile"
        ON users FOR SELECT
        TO authenticated
        USING (id = auth.uid());
    END IF;
END $$;

-- =====================================================
-- 5. BATCHES & COURSES (Example of Scalable Policy Check)
-- =====================================================

-- Batches
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'batches' AND policyname = 'Users can view batches in their coaching') THEN
        CREATE POLICY "Users can view batches in their coaching"
        ON batches FOR SELECT TO authenticated
        USING (coaching_id = auth.current_user_coaching_id());
    END IF;
END $$;

-- Courses
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'courses' AND policyname = 'Users can view courses in their coaching') THEN
        CREATE POLICY "Users can view courses in their coaching"
        ON courses FOR SELECT TO authenticated
        USING (coaching_id = auth.current_user_coaching_id());
    END IF;
END $$;

-- Announcements
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Users can view announcements in their coaching') THEN
        CREATE POLICY "Users can view announcements in their coaching"
        ON announcements FOR SELECT TO authenticated
        USING (coaching_id = auth.current_user_coaching_id());
    END IF;
END $$;
