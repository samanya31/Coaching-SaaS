-- Student Authentication Setup
-- Admin-only student creation + OTP-only login
-- No self-registration, no passwords

-- NOTE: Not adding foreign key constraint because existing users in database
-- were created without auth.users entries. 
-- For NEW students, the createStudentAccount service will ensure proper linking.
-- Future: Clean up orphaned users and add constraint

-- Query to find orphaned users (for manual cleanup later):
-- SELECT id, full_name, email, phone FROM public.users 
-- WHERE id NOT IN (SELECT id FROM auth.users);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_id_coaching ON public.users(id, coaching_id);

-- Simple RLS policy (no role check in RLS - keep it simple)
DROP POLICY IF EXISTS "Students can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
USING (id = auth.uid());

-- Users can update their own profile (for onboarding)
DROP POLICY IF EXISTS "Students can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (id = auth.uid());

-- Note: Admin policies for INSERT/DELETE already exist from previous migrations
-- This migration focuses on STUDENT access patterns only
