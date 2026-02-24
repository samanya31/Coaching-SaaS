-- Recreate payments table with improved schema
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL, -- Allow batch to be null if general payment? Or enforce? Let's keep optional for now but encourage it.
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'upi', 'card', 'netbanking', 'cash')),
    transaction_id TEXT, -- Can be null for cash
    description TEXT,
    date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_payments_coaching_id ON payments(coaching_id);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_batch_id ON payments(batch_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(date);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can view/manage all payments for their coaching
-- Admins can view/manage all payments for their coaching
DROP POLICY IF EXISTS "Admins can view payments" ON payments;
CREATE POLICY "Admins can view payments"
    ON payments FOR SELECT
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('coaching_admin', 'admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can insert payments" ON payments;
CREATE POLICY "Admins can insert payments"
    ON payments FOR INSERT
    WITH CHECK (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('coaching_admin', 'admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can update payments" ON payments;
CREATE POLICY "Admins can update payments"
    ON payments FOR UPDATE
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('coaching_admin', 'admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can delete payments" ON payments;
CREATE POLICY "Admins can delete payments"
    ON payments FOR DELETE
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('coaching_admin', 'admin', 'super_admin')
        )
    );

-- Students can view their own payments
CREATE POLICY "Students can view own payments"
    ON payments FOR SELECT
    USING (
        student_id = auth.uid()
    );

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
