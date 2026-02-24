-- Create banners table for promotional content
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title TEXT,
    link_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_banners_coaching_id ON banners(coaching_id);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banners

-- Admins can view all banners for their coaching
CREATE POLICY "Admins can view all banners"
    ON banners FOR SELECT
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Public/Users can view active banners
CREATE POLICY "Public can view active banners"
    ON banners FOR SELECT
    USING (
        is_active = true
    );

-- Admins can manage (insert/update/delete) banners
CREATE POLICY "Admins can manage banners"
    ON banners FOR ALL
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Trigger for display_order (optional logic, but basic table doesn't need trigger for update if no updated_at column or complex logic)
-- Actually, let's keep it simple. No updated_at column in schema plan, but good to have.
-- Let's add updated_at to be consistent.
ALTER TABLE banners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
