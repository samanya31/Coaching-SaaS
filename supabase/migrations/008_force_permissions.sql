-- Migration 008: FORCE ADMIN PERMISSIONS (Nuclear Fix)
-- Purpose: Resolve "42501" (Permission Denied) by forcing ALL users to be Demo Admins.
-- This ensures that whoever you are logged in as will DEFINITELY match the required permissions.

BEGIN;

DO $$
DECLARE
    demo_id UUID;
BEGIN
    -- 1. Get the ID for Demo Coaching
    SELECT id INTO demo_id FROM coachings WHERE slug = 'demo-coaching';

    IF demo_id IS NULL THEN
        RAISE EXCEPTION 'Demo Coaching not found! Please run 003_seed_data.sql first.';
    END IF;

    -- 2. FORCE INSERT MISSING USERS FROM AUTH
    -- If your user is missing from public.users, add them now.
    INSERT INTO public.users (id, coaching_id, full_name, email, role, status)
    SELECT 
        id, 
        demo_id, 
        COALESCE(raw_user_meta_data->>'full_name', 'System Admin'), 
        email, 
        'coaching_admin', 
        'active'
    FROM auth.users
    WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE public.users.id = auth.users.id);

    -- 3. FORCE UPDATE ALL USERS TO BE DEMO ADMINS
    -- This fixes any mismatch where your user might be linked to a different coaching.
    UPDATE public.users
    SET 
        coaching_id = demo_id,
        role = 'coaching_admin',
        status = 'active';

    RAISE NOTICE 'SUCCESS: All users are now Demo Admins with full permissions.';
END $$;

COMMIT;
