-- =====================================================
-- MIGRATION 002: HELPER FUNCTIONS (Hardened)
-- =====================================================
-- Date: February 12, 2026
-- Purpose: RLS Helper Functions in PUBLIC schema
-- Improvements: Fixed security definers, public access
-- =====================================================

-- 1. GET COACHING ID
-- Returns the coaching_id for the current authenticated user
CREATE OR REPLACE FUNCTION public.current_user_coaching_id()
RETURNS UUID AS $$
    SELECT coaching_id FROM public.users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 2. GET USER ROLE
-- Returns the role of the current user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.users WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 3. CHECK SUPER ADMIN
-- Returns true if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 4. CHECK COACHING ADMIN
-- Returns true if user is coaching_admin OR super_admin
CREATE OR REPLACE FUNCTION public.is_coaching_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('coaching_admin', 'super_admin')
    )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 5. CHECK TEACHER
-- Returns true if user is teacher, coaching_admin, or super_admin
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('teacher', 'coaching_admin', 'super_admin')
    )
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 6. GRANT EXECUTE PERMISSIONS
-- Ensure these functions can be used in RLS policies by authenticated users
GRANT EXECUTE ON FUNCTION public.current_user_coaching_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_coaching_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_coaching_id() TO anon; -- Needed? Maybe not, but safe for checking
