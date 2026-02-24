-- Diagnostic: Check if password_hash column exists and has data

-- 1. Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'password_hash';

-- 2. Check staff members with password_hash
SELECT 
    id,
    email,
    full_name,
    role,
    password_hash,
    CASE 
        WHEN password_hash IS NULL THEN 'NO PASSWORD'
        WHEN password_hash = '' THEN 'EMPTY STRING'
        ELSE 'HAS PASSWORD'
    END as password_status
FROM public.users
WHERE role IN ('teacher', 'coaching_admin')
ORDER BY created_at DESC
LIMIT 10;

-- 3. If column doesn't exist, add it
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 4. If staff exists but password is NULL, update it
-- UPDATE public.users 
-- SET password_hash = 'YOUR_PASSWORD'
-- WHERE email = 'staff@example.com';
