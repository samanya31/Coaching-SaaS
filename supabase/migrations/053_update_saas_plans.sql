-- 1. Add new feature flag columns to saas_plans
ALTER TABLE saas_plans 
ADD COLUMN IF NOT EXISTS banners_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS branding_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS reports_enabled BOOLEAN NOT NULL DEFAULT false;

-- 2. Update existing plans with new pricing, limits, and flags
-- We rename them to unique temporary names first to avoid collision on the 'name' UNIQUE constraint

UPDATE saas_plans SET name = 'TMP_Basic' WHERE slug = 'basic';
UPDATE saas_plans SET name = 'TMP_Advanced' WHERE slug = 'pro';
UPDATE saas_plans SET name = 'TMP_Pro' WHERE slug = 'advanced';

-- Now set the final names and values
-- BASIC PLAN
UPDATE saas_plans
SET 
  name = 'Basic',
  price_monthly = 2499,
  price_yearly = 25999,
  max_storage_gb = 100,
  tests_enabled = false,
  banners_enabled = false,
  branding_enabled = false,
  reports_enabled = false,
  payments_enabled = false,
  custom_domain = false,
  support_level = 'email',
  description = 'Everything you need to get started with basic coaching management and 100GB storage.'
WHERE slug = 'basic';

-- ADVANCED PLAN (Intermediate)
UPDATE saas_plans
SET 
  name = 'Advanced',
  price_monthly = 3999,
  price_yearly = 41999,
  max_storage_gb = 250,
  tests_enabled = true,
  banners_enabled = true,
  branding_enabled = true,
  reports_enabled = true,
  payments_enabled = true,
  custom_domain = false,
  support_level = 'priority',
  description = 'Scale your coaching with full test management, customized banners, and priority support.'
WHERE slug = 'pro';

-- PRO PLAN (Highest)
UPDATE saas_plans
SET 
  name = 'Pro',
  price_monthly = 7999,
  price_yearly = 74999,
  max_storage_gb = 500,
  tests_enabled = true,
  banners_enabled = true,
  branding_enabled = true,
  reports_enabled = true,
  payments_enabled = true,
  custom_domain = true,
  support_level = 'dedicated',
  description = 'The ultimate platform for established institutes. Includes custom domains and dedicated support.'
WHERE slug = 'advanced';
