-- =============================================
-- Super Admin: SaaS Billing Table
-- =============================================
CREATE TABLE IF NOT EXISTS saas_billing (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coaching_id      UUID REFERENCES coachings(id) ON DELETE SET NULL,
  amount           NUMERIC NOT NULL,
  plan             TEXT NOT NULL,            -- 'starter' | 'pro' | 'enterprise'
  billing_period   TEXT NOT NULL,            -- 'monthly' | 'yearly'
  status           TEXT NOT NULL DEFAULT 'paid', -- 'paid' | 'pending' | 'failed'
  transaction_id   TEXT,                     -- for future Razorpay/Stripe
  invoice_date     TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_saas_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saas_billing_updated_at
  BEFORE UPDATE ON saas_billing
  FOR EACH ROW EXECUTE FUNCTION update_saas_billing_updated_at();

-- RLS: only superadmin can read/write (coaching_id = NULL on their user row)
ALTER TABLE saas_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "superadmin_all" ON saas_billing
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- =============================================
-- RLS: Allow superadmin to see ALL coaching data
-- =============================================
-- Add superadmin bypass to coachings (to count all institutes)
CREATE POLICY "superadmin_view_all_institutes" ON coachings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- NOTE: Do NOT add a policy on 'users' that queries 'users' inside itself --
-- that causes infinite RLS recursion (500 errors).
-- Superadmin reads their own users row via the existing "users can read own row" policy.
-- The role = 'superadmin' check is done in application code (JavaScript), not in DB.
