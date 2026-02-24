-- =====================================================
-- MIGRATION 019: FIX TESTS RLS POLICIES (Simplification)
-- =====================================================
-- Purpose: 
-- Relax the strict coaching_id check on INSERTs for tests.
-- Sometimes get_user_coaching_id() returns a different ID or null if not properly set,
-- causing valid admin inserts to fail.
-- =====================================================

-- 1. DROP EXISTING STRICT POLICY FOR TESTS
DROP POLICY IF EXISTS "admin_manage_tests" ON tests;
DROP POLICY IF EXISTS "view_tests" ON tests;

-- 2. CREATE SEPARATE POLICIES

-- VIEW: Anyone in the same coaching
CREATE POLICY "view_tests"
    ON tests FOR SELECT
    USING (coaching_id = public.get_user_coaching_id());

-- INSERT: Admins can insert tests (trusting app logic for coaching_id)
-- This removes the recursive check against the coaching table during insert
CREATE POLICY "admin_insert_tests"
    ON tests FOR INSERT
    WITH CHECK (
        public.check_is_admin()
    );

-- UPDATE/DELETE: Admins can only modify their own coaching's tests
CREATE POLICY "admin_modify_tests"
    ON tests FOR UPDATE
    USING (public.check_is_admin() AND coaching_id = public.get_user_coaching_id());

CREATE POLICY "admin_delete_tests"
    ON tests FOR DELETE
    USING (public.check_is_admin() AND coaching_id = public.get_user_coaching_id());

-- 3. ENSURE USERS TABLE IS READABLE (Just in case functions need it)
DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own"
    ON users FOR SELECT
    USING (id = auth.uid());
