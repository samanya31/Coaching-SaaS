-- Create global_exam_goals table for Super Admin
CREATE TABLE IF NOT EXISTS public.global_exam_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.global_exam_goals ENABLE ROW LEVEL SECURITY;

-- Policies for global_exam_goals
DROP POLICY IF EXISTS "Super Admins can manage global exam goals" ON public.global_exam_goals;
CREATE POLICY "Super Admins can manage global exam goals"
    ON public.global_exam_goals
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Anyone can read global exam goals" ON public.global_exam_goals;
CREATE POLICY "Anyone can read global exam goals"
    ON public.global_exam_goals
    FOR SELECT
    USING (true);

-- Insert seed data
INSERT INTO public.global_exam_goals (name, icon) VALUES
    ('UPSC', '🏛️'),
    ('JEE', '⚛️'),
    ('NEET', '🩺'),
    ('SSC', '🏢'),
    ('Bank PO', '🏦'),
    ('CAT', 'MBA'),
    ('Gateway', '🚪'),
    ('NDA', '⚔️')
ON CONFLICT (name) DO NOTHING;
