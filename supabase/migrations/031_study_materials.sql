-- Migration: Add Study Materials table (URL-based, no file upload)
-- Materials will link to external URLs (Google Drive, R2, etc.)

CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE NOT NULL,
    coaching_id UUID REFERENCES public.coachings(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL, -- External URL (Google Drive, R2, etc.)
    file_type TEXT DEFAULT 'pdf', -- pdf, doc, etc.
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_materials_batch ON public.study_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_coaching ON public.study_materials(coaching_id);

-- Enable RLS
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view materials from their enrolled batches
CREATE POLICY "Students can view study materials from enrolled batches"
ON public.study_materials
FOR SELECT
USING (
    batch_id IN (
        SELECT batch_id FROM public.batch_enrollments
        WHERE user_id = auth.uid()
    )
    OR
    -- Allow staff to view all materials in their coaching
    coaching_id IN (
        SELECT coaching_id FROM public.users
        WHERE id = auth.uid()
        AND role IN ('coaching_admin', 'super_admin', 'teacher', 'staff')
    )
);

-- Policy: Staff can manage study materials in their coaching
CREATE POLICY "Staff can manage study materials"
ON public.study_materials
FOR ALL
USING (
    coaching_id IN (
        SELECT coaching_id FROM public.users
        WHERE id = auth.uid()
        AND role IN ('coaching_admin', 'super_admin', 'teacher', 'staff')
    )
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_study_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER study_materials_updated_at
BEFORE UPDATE ON public.study_materials
FOR EACH ROW
EXECUTE FUNCTION update_study_materials_updated_at();
