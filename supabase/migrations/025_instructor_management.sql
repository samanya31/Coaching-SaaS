-- Migration for Instructor Management upgrades
-- 1. Create staff_payments table for storing salary/payout records
-- 2. Add instructor_id to batches table to link batches to teachers

-- 1. Create staff_payments table
CREATE TABLE IF NOT EXISTS staff_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_month TEXT, -- e.g., '2023-10' or 'October 2023' to track monthly salaries
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    method TEXT CHECK (method IN ('cash', 'upi', 'bank_transfer', 'cheque')),
    reference_id TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_payments_coaching ON staff_payments(coaching_id);
CREATE INDEX IF NOT EXISTS idx_staff_payments_staff ON staff_payments(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_payments_date ON staff_payments(payment_date);

-- Enable Row Level Security
ALTER TABLE staff_payments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage staff payments" ON staff_payments;
CREATE POLICY "Admins can manage staff payments"
    ON staff_payments FOR ALL
    USING (
        coaching_id IN (
            SELECT coaching_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('coaching_admin', 'admin', 'super_admin')
        )
    );

-- Staff can view their own payments
DROP POLICY IF EXISTS "Staff can view own payments" ON staff_payments;
CREATE POLICY "Staff can view own payments"
    ON staff_payments FOR SELECT
    USING (staff_id = auth.uid());


-- 2. Add instructor_id to batches table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'batches' AND column_name = 'instructor_id') THEN
        ALTER TABLE batches ADD COLUMN instructor_id UUID REFERENCES users(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_batches_instructor ON batches(instructor_id);
    END IF;
END $$;
