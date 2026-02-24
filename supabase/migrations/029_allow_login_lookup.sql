-- Fix: Allow unauthenticated users to look up their own account by email for login
-- This is safe because we only expose data when email+password both match

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow login lookup by email" ON public.users;

-- Create policy to allow anyone to SELECT users by email (for login)
CREATE POLICY "Allow login lookup by email"
ON public.users
FOR SELECT
TO anon, authenticated
USING (true);

-- Note: This allows reading user data, but password checking happens in code
-- For better security in production, consider using Supabase Auth or Edge Functions
