-- =====================================================
-- MIGRATION 020: DEBUG ALLOW ALL TESTS
-- =====================================================
-- Purpose: 
-- Temporarily allow ALL authenticated users to insert tests.
-- This bypasses the role check to identify if the issue is with
-- permissions or something else.
-- =====================================================

-- 1. DROP EXISTING POLICIES ON TESTS
DROP POLICY IF EXISTS "admin_insert_tests" ON tests;
DROP POLICY IF EXISTS "admin_manage_tests" ON tests;
DROP POLICY IF EXISTS "view_tests" ON tests;
DROP POLICY IF EXISTS "admin_modify_tests" ON tests;
DROP POLICY IF EXISTS "admin_delete_tests" ON tests;

-- 2. CREATE ULTRA-PERMISSIVE POLICIES (AUTHENTICATED ONLY)

-- VIEW: Anyone authenticated can view tests (for debugging)
CREATE POLICY "debug_view_tests"
    ON tests FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Anyone authenticated can insert (trusting app logic)
CREATE POLICY "debug_insert_tests"
    ON tests FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE/DELETE: Anyone authenticated can modify (trusting app logic)
CREATE POLICY "debug_modify_tests"
    ON tests FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "debug_delete_tests"
    ON tests FOR DELETE
    TO authenticated
    USING (true);
