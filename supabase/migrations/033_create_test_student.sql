-- Create Test Student for Authentication Testing (EMAIL + PASSWORD)
-- This creates a test student account that can login with email+password
-- Email: teststudent@test.com
-- Password: test123 (for testing only)

DO $$
DECLARE
    new_user_id uuid;
    first_coaching_id uuid;
BEGIN
    -- Get the first coaching ID
    SELECT id INTO first_coaching_id FROM public.coachings LIMIT 1;
    
    IF first_coaching_id IS NULL THEN
        RAISE EXCEPTION 'No coaching found. Please create a coaching first.';
    END IF;

    -- Delete existing test student if exists
    DELETE FROM public.users WHERE email = 'teststudent@test.com' OR phone = '+919876543210';
    DELETE FROM auth.users WHERE email = 'teststudent@test.com' OR phone = '+919876543210';

    -- Create auth user with EMAIL + PASSWORD
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        phone,
        phone_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'teststudent@test.com', -- EMAIL for login
        crypt('test123', gen_salt('bf')), -- Password: test123
        NOW(), -- Email confirmed
        '+919876543210', -- Phone for display
        NOW(),
        '{"provider":"email","providers":["email"]}', -- Email provider
        '{}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO new_user_id;
    
    -- Create profile in users table (empty full_name for onboarding test)
    INSERT INTO public.users (
        id,
        coaching_id,
        email,
        phone,
        full_name,
        exam_goal,
        language,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        first_coaching_id,
        'teststudent@test.com',
        '+919876543210',
        '', -- Empty - will trigger onboarding
        'JEE',
        'English',
        'student',
        'active',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Test student created successfully!';
    RAISE NOTICE 'User ID: %', new_user_id;
    RAISE NOTICE 'Coaching ID: %', first_coaching_id;
    RAISE NOTICE 'Email: teststudent@test.com';
    RAISE NOTICE 'Password: test123';
    RAISE NOTICE '---';
    RAISE NOTICE 'Login with EMAIL instead of phone!';
    
END $$;

-- Verify the test student was created
SELECT 
    u.id,
    u.email,
    u.phone,
    u.full_name,
    u.coaching_id,
    c.name as coaching_name,
    u.role,
    u.status
FROM public.users u
JOIN public.coachings c ON c.id = u.coaching_id
WHERE u.email = 'teststudent@test.com';
