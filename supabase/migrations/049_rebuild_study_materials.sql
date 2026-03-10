-- Migration 049: Rebuild Study Materials Space
-- Drops the problematic study_materials table and recreates it cleanly with explicit constraints

BEGIN;

-- 1. Drop existing table entirely
DROP TABLE IF EXISTS public.study_materials CASCADE;

-- 2. Recreate cleanly
CREATE TABLE public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coaching_id UUID NOT NULL REFERENCES public.coachings(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT 'file',
    is_public BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'General',
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX idx_study_materials_coaching ON public.study_materials(coaching_id);
CREATE INDEX idx_study_materials_batch ON public.study_materials(batch_id);

-- 4. Triggers
DROP TRIGGER IF EXISTS study_materials_updated_at ON public.study_materials;
CREATE TRIGGER study_materials_updated_at
BEFORE UPDATE ON public.study_materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- VIEW POLICY 1: Public Materials (Current Affairs)
CREATE POLICY "Public materials are viewable by everyone"
ON public.study_materials FOR SELECT
USING (is_public = true);

-- VIEW POLICY 2: Enrolled Batch Materials
CREATE POLICY "Students can view study materials from enrolled batches" 
ON public.study_materials FOR SELECT 
USING (
    batch_id IN (
        SELECT batch_id 
        FROM public.batch_enrollments 
        WHERE user_id = auth.uid() 
        AND status = 'active'
    )
);

-- VIEW POLICY 3: Staff and Admins
CREATE POLICY "Teachers and Admins can view study materials"
ON public.study_materials FOR SELECT
TO authenticated
USING (coaching_id = public.current_user_coaching_id());

-- INSERT POLICY (Crucial fix matching 'batches')
CREATE POLICY "Teachers and Admins can insert study materials"
ON public.study_materials FOR INSERT
TO authenticated
WITH CHECK (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

-- UPDATE POLICY
CREATE POLICY "Teachers and Admins can update study materials"
ON public.study_materials FOR UPDATE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin', 'teacher')
);

-- DELETE POLICY
CREATE POLICY "Admins can delete study materials"
ON public.study_materials FOR DELETE
TO authenticated
USING (
    coaching_id = public.current_user_coaching_id()
    AND public.current_user_role() IN ('coaching_admin', 'admin')
);

COMMIT;
