-- =====================================================
-- QUICK FIX: Run this FIRST before the main RLS file
-- =====================================================
-- This creates the helper functions that policies will reference
-- Run this BEFORE running 002_rls_policies.sql

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
-- NOW use these aliases so policies work with "auth."
-- =====================================================

-- Create aliases in auth schema (points to public functions)
CREATE OR REPLACE FUNCTION auth.current_user_coaching_id()
RETURNS UUID AS $$
    SELECT public.current_user_coaching_id()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS TEXT AS $$
    SELECT public.current_user_role()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT public.is_super_admin()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_coaching_admin()
RETURNS BOOLEAN AS $$
    SELECT public.is_coaching_admin()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =====================================================
-- ✅ DONE!
-- Now you can run the original 002_rls_policies.sql file
-- =====================================================
