-- Migration: Reset Existing Staff Passwords
-- Existing staff have plain text passwords that need to be reset
-- They will need to be recreated with hashed passwords

-- OPTION 1: Delete existing staff and recreate them
-- WARNING: This will delete all current staff members!
-- Uncomment if you want to reset all staff:
/*
DELETE FROM public.users 
WHERE password_hash IS NOT NULL 
AND role IN ('teacher', 'coaching_admin');
*/

-- OPTION 2: Set password_hash to NULL for existing staff
-- They will need to be recreated via the UI
UPDATE public.users
SET password_hash = NULL
WHERE password_hash IS NOT NULL
  AND role IN ('teacher', 'coaching_admin')
  AND LENGTH(password_hash) < 60; -- bcrypt hashes are 60 chars, plain text is shorter

-- Now all existing staff need to be recreated via Settings → Staff Management
-- New staff will have properly hashed passwords
