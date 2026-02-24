-- Create exam_goals table
CREATE TABLE IF NOT EXISTS public.exam_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT, -- Stores emoji or icon URL
    color TEXT DEFAULT 'bg-blue-100', -- For UI styling
    coaching_id UUID REFERENCES public.coachings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exam_goals ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can read exam goals (for students to select)
CREATE POLICY "Everyone can read exam goals" ON public.exam_goals
    FOR SELECT USING (true);

-- Only admins/staff can insert/update/delete
CREATE POLICY "Admins can manage exam goals" ON public.exam_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'coaching_admin')
        )
    );

-- Seed some initial data (optional, preventing empty state)
-- Insert strictly if table is empty for a specific coaching (logic handled in app usually, but here just structure)
-- For now, we leave it empty or user enters manually.
