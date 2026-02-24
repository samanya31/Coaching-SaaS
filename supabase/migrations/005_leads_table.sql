-- Create leads table for capturing new user onboarding data
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    course_interest TEXT,
    language_preference TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_coaching_id ON leads(coaching_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads

-- Admins can view leads for their coaching
CREATE POLICY "Admins can view leads"
    ON leads FOR SELECT
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can update leads
CREATE POLICY "Admins can update leads"
    ON leads FOR UPDATE
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Authenticated users (students/leads) can insert their own data
-- Note: In a real scenario, we might want to link this to auth.uid() if possible, 
-- or just allow authenticated inserts if the phone matches.
CREATE POLICY "Authenticated users can create leads"
    ON leads FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
