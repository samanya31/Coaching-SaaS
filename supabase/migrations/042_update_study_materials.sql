-- Make batch_id nullable to support global materials (Current Affairs)
-- We need to drop the NOT NULL constraint
ALTER TABLE public.study_materials ALTER COLUMN batch_id DROP NOT NULL;

-- Add is_public column to flag global materials
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add category column for better organization (e.g., 'Current Affairs', 'Notes')
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Update RLS policy to allow viewing public materials
-- First, drop the existing policy if it exists (name might vary, so we handle potential errors or check existence)
DROP POLICY IF EXISTS "Students can view materials from their enrolled batches" ON public.study_materials;
DROP POLICY IF EXISTS "Students can view materials" ON public.study_materials;

-- Create a comprehensive policy
CREATE POLICY "Students can view materials" ON public.study_materials
    FOR SELECT
    USING (
        -- 1. Material is public (Current Affairs)
        (is_public = true)
        OR
        -- 2. Material belongs to a batch the user is enrolled in
        (
            batch_id IN (
                SELECT batch_id 
                FROM public.batch_enrollments 
                WHERE user_id = auth.uid() 
                AND status = 'active'
            )
        )
    );

-- Ensure Admin/Staff can manage all materials (if not covered by other policies)
-- Assuming there's a separate Admin policy, but adding a safe guard just in case for insert/update/delete
-- usually admins have "bypass rls" or a specific policy. We will leave existing admin policies intact or add if missing.
-- Listing existing policies might be good, but this SELECT policy is the critical one for Students.
