-- FRESH START: Drop and recreate banners table with complete fields
-- This migration starts from scratch to avoid any RLS conflicts

-- 1. Drop the existing table (this removes all policies too)
DROP TABLE IF EXISTS public.banners CASCADE;

-- 2. Create ENUM types for banner categorization
CREATE TYPE banner_type AS ENUM ('public_website', 'student_dashboard');
CREATE TYPE banner_audience AS ENUM ('all', 'jee', 'neet', 'upsc', 'foundation', 'ssc', 'banking');

-- 3. Create the banners table with all fields
CREATE TABLE public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    
    -- Image & Content
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    
    -- Call to Action
    cta_text TEXT,
    cta_link TEXT,
    
    -- Categorization
    type banner_type DEFAULT 'public_website',
    target_audience banner_audience DEFAULT 'all',
    
    -- Display Control
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Scheduling
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes for better query performance
CREATE INDEX idx_banners_coaching_id ON public.banners(coaching_id);
CREATE INDEX idx_banners_is_active ON public.banners(is_active);
CREATE INDEX idx_banners_type ON public.banners(type);
CREATE INDEX idx_banners_target_audience ON public.banners(target_audience);
CREATE INDEX idx_banners_dates ON public.banners(start_date, end_date);

-- 5. Add updated_at trigger
CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 7. SIMPLIFIED RLS POLICIES

-- Anyone can view active banners (for public website)
CREATE POLICY "anyone_view_active_banners"
    ON public.banners
    FOR SELECT
    USING (is_active = true);

-- Authenticated users can view all banners from their coaching
CREATE POLICY "authenticated_view_coaching_banners"
    ON public.banners
    FOR SELECT
    TO authenticated
    USING (
        coaching_id IN (
            SELECT u.coaching_id 
            FROM public.users u 
            WHERE u.id = auth.uid()
        )
    );

-- Authenticated users can INSERT banners for their coaching
CREATE POLICY "authenticated_insert_banners"
    ON public.banners
    FOR INSERT
    TO authenticated
    WITH CHECK (
        coaching_id IN (
            SELECT u.coaching_id 
            FROM public.users u 
            WHERE u.id = auth.uid()
        )
    );

-- Authenticated users can UPDATE banners from their coaching
CREATE POLICY "authenticated_update_banners"
    ON public.banners
    FOR UPDATE
    TO authenticated
    USING (
        coaching_id IN (
            SELECT u.coaching_id 
            FROM public.users u 
            WHERE u.id = auth.uid()
        )
    );

-- Authenticated users can DELETE banners from their coaching
CREATE POLICY "authenticated_delete_banners"
    ON public.banners
    FOR DELETE
    TO authenticated
    USING (
        coaching_id IN (
            SELECT u.coaching_id 
            FROM public.users u 
            WHERE u.id = auth.uid()
        )
    );

-- 8. Ensure users table allows reading for RLS checks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'users_read_own_for_rls'
    ) THEN
        CREATE POLICY "users_read_own_for_rls"
            ON public.users
            FOR SELECT
            TO authenticated
            USING (id = auth.uid());
    END IF;
END $$;

-- 9. Grant table access
GRANT ALL ON public.banners TO authenticated;
GRANT SELECT ON public.banners TO anon;
