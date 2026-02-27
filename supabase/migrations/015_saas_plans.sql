-- =============================================
-- SaaS Plans Table
-- =============================================
CREATE TABLE IF NOT EXISTS saas_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,           -- 'Basic' | 'Pro' | 'Advanced'
  slug          TEXT NOT NULL UNIQUE,           -- 'basic' | 'pro' | 'advanced'
  price_monthly NUMERIC NOT NULL DEFAULT 0,     -- your monthly charge in INR
  price_yearly  NUMERIC NOT NULL DEFAULT 0,     -- your yearly charge in INR
  -- Feature limits
  max_students        INTEGER NOT NULL DEFAULT 50,
  max_storage_gb      NUMERIC NOT NULL DEFAULT 5,
  -- Feature flags
  live_classes        BOOLEAN NOT NULL DEFAULT false,
  tests_enabled       BOOLEAN NOT NULL DEFAULT false,
  payments_enabled    BOOLEAN NOT NULL DEFAULT false,
  custom_domain       BOOLEAN NOT NULL DEFAULT false,
  -- Support tier
  support_level       TEXT NOT NULL DEFAULT 'community',  -- 'community' | 'email' | 'priority' | 'dedicated'
  -- UI
  is_popular          BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  description         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update trigger
CREATE TRIGGER saas_plans_updated_at
  BEFORE UPDATE ON saas_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: only superadmin can manage plans, everyone can read
ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans_public_read" ON saas_plans
  FOR SELECT USING (true);

CREATE POLICY "plans_superadmin_write" ON saas_plans
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superadmin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'superadmin')
  );

-- =============================================
-- Link coachings → saas_plans (optional FK)
-- =============================================
ALTER TABLE coachings ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES saas_plans(id) ON DELETE SET NULL;

-- =============================================
-- Seed: Default plans
-- =============================================
INSERT INTO saas_plans (name, slug, price_monthly, price_yearly, max_students, max_storage_gb, live_classes, tests_enabled, payments_enabled, custom_domain, support_level, is_popular, sort_order, description)
VALUES
  ('Basic',    'basic',    999,  9999,  100,  10,  false, true,  false, false, 'email',     false, 1, 'Perfect for small coaching institutes getting started.'),
  ('Pro',      'pro',      2499, 24999, 500,  50,  true,  true,  true,  false, 'priority',  true,  2, 'For growing institutes with live classes and payment collection.'),
  ('Advanced', 'advanced', 4999, 49999, 2000, 250, true,  true,  true,  true,  'dedicated', false, 3, 'Unlimited scale with custom domain and dedicated support.')
ON CONFLICT (slug) DO NOTHING;
