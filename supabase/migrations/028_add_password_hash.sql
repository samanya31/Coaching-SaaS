-- Add password_hash column to users table for staff authentication
-- This allows staff to have passwords stored directly (like AdminManagement.tsx approach)

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment
COMMENT ON COLUMN public.users.password_hash IS 'Password hash for staff members who use custom authentication (not Supabase Auth)';
