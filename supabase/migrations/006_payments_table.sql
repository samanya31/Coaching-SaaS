-- Create payments table for transaction history
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    payment_method TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_coaching_id ON payments(coaching_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments

-- Admins can view payments for their coaching
CREATE POLICY "Admins can view payments"
    ON payments FOR SELECT
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Students can view their own payments
CREATE POLICY "Students can view own payments"
    ON payments FOR SELECT
    USING (
        student_id = auth.uid()
    );

-- Admins can insert/update payments (Manual entry or system integration)
CREATE POLICY "Admins can manage payments"
    ON payments FOR ALL
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
