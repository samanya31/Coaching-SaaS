-- Migration 007: Comprehensive Fix for RLS & User Sync
-- Problem: You are logged in, but your user might not exist in the 'public.users' table, causing RLS checks to fail.
-- Solution:
-- 1. Sync all existing Auth Users into public.users (as Demo Admins by default).
-- 2. Re-apply the Batches RLS policies to allow Admins to create batches.

BEGIN;

-- =====================================================
-- STEP 1: SYNC USERS
-- =====================================================
DO $$
DECLARE
    demo_id UUID;
BEGIN
    -- Get the ID for Demo Coaching
    SELECT id INTO demo_id FROM coachings WHERE slug = 'demo-coaching';

    -- If Demo Coaching exists, sync all auth users who are missing from public.users
    IF demo_id IS NOT NULL THEN
        INSERT INTO public.users (id, coaching_id, full_name, email, role, status)
        SELECT 
            id, 
            demo_id, 
            COALESCE(raw_user_meta_data->>'full_name', 'Admin User'), 
            email, 
            'coaching_admin', 
            'active'
        FROM auth.users
        WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE public.users.id = auth.users.id);
        
        RAISE NOTICE 'Synced missing users to public.users as Demo Admins.';
    END IF;
END $$;

-- =====================================================
-- STEP 2: FIX BATCH RLS POLICIES (Re-applying for safety)
-- =====================================================

-- Ensure RLS is enabled
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting old policies
DROP POLICY IF EXISTS "Teachers can create batches" ON batches;
DROP POLICY IF EXISTS "Teachers can update batches" ON batches;
DROP POLICY IF EXISTS "Users can view batches in their coaching" ON batches;
DROP POLICY IF EXISTS "Admins can delete batches" ON batches;
DROP POLICY IF EXISTS "Teachers and Admins can create batches" ON batches;
DROP POLICY IF EXISTS "Teachers and Admins can update batches" ON batches;

-- Re-create reliable policies

-- 1. VIEW: Everyone in the coaching can view batches
CREATE POLICY "Users can view batches in their coaching"
ON batches FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- 2. CREATE: Admins, Coaching Admins, and Teachers can create
CREATE POLICY "Unified Create Policy for Batches"
ON batches FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

-- 3. UPDATE: Admins, Coaching Admins, and Teachers can update
CREATE POLICY "Unified Update Policy for Batches"
ON batches FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

-- 4. DELETE: Only Admins can delete
CREATE POLICY "Unified Delete Policy for Batches"
ON batches FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin')
);

COMMIT;
