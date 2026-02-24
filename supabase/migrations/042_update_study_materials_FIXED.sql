-- FIXED MIGRATION: 042_update_study_materials_FIXED.sql
-- Run this to fix the 400 Bad Request error

-- 1. Add columns safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_materials' AND column_name = 'is_public') THEN
        ALTER TABLE public.study_materials ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_materials' AND column_name = 'category') THEN
        ALTER TABLE public.study_materials ADD COLUMN category TEXT DEFAULT 'General';
    END IF;
END $$;

-- 2. Make batch_id nullable (so you can have global materials)
ALTER TABLE public.study_materials ALTER COLUMN batch_id DROP NOT NULL;

-- 3. Update Policy
-- First drop to ensure clean slate
DROP POLICY IF EXISTS "Students can view materials from their enrolled batches" ON public.study_materials;
DROP POLICY IF EXISTS "Students can view materials" ON public.study_materials;

-- Create the new policy
CREATE POLICY "Students can view materials" ON public.study_materials
    FOR SELECT
    USING (
        -- Public (Current Affairs) OR Enrolled Batch
        (is_public = true)
        OR
        (
            batch_id IN (
                SELECT batch_id 
                FROM public.batch_enrollments 
                WHERE user_id = auth.uid() 
                AND status = 'active'
            )
        )
    );

-- 4. Enable RLS (just in case)
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
