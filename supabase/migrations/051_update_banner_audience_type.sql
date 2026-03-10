-- Migration: Update banner target_audience to support dynamic strings
-- Issue: The target_audience column was strictly typed to a static ENUM ('all', 'jee', 'neet', etc.), 
-- which blocked the insertion of dynamic, user-created exam goals.

-- 1. Drop the default constraint that implicitly relies on the ENUM type
ALTER TABLE public.banners ALTER COLUMN target_audience DROP DEFAULT;

-- 2. Alter the column type from ENUM to TEXT, casting existing values to text
ALTER TABLE public.banners
  ALTER COLUMN target_audience TYPE text USING target_audience::text;

-- 3. Set a new default value as pure text
ALTER TABLE public.banners ALTER COLUMN target_audience SET DEFAULT 'All';

-- 4. Drop the now-unused ENUM type (using CASCADE to ensure any hidden dependencies are purged)
DROP TYPE IF EXISTS banner_audience CASCADE;

-- 5. In the future, if custom constraints are needed, they can be managed via foreign keys 
-- to the `exam_goals` table, but TEXT is sufficient for arbitrary label matching.
