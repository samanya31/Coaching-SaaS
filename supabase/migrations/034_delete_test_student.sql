-- Delete existing test student (if exists)
-- This allows you to recreate the test student for testing

-- Step 1: Delete from public.users first (child table)
DELETE FROM public.users WHERE phone = '+919876543210';

-- Step 2: Delete from auth.users (parent table)
DELETE FROM auth.users WHERE phone = '+919876543210';

-- Verify deletion
SELECT 
    'Deleted test student' as status,
    COUNT(*) as remaining_count
FROM auth.users 
WHERE phone = '+919876543210';
