-- Add address and personal_email columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS personal_email TEXT;

-- Drop potentially conflicting versions of the function
DROP FUNCTION IF EXISTS create_student_account(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS create_student_account(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, UUID, TEXT, TEXT);

-- Create the NEW function with REORDERED parameters (Mandatory ones first)
CREATE OR REPLACE FUNCTION create_student_account(
    p_email TEXT,
    p_password TEXT,
    p_phone TEXT,
    p_full_name TEXT,
    p_coaching_id UUID,
    p_address TEXT, -- Moved up (Mandatory)
    p_exam_goal TEXT DEFAULT NULL,
    p_batch_id UUID DEFAULT NULL,
    p_personal_email TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_encrypted_password TEXT;
BEGIN
    -- Generate UUID for new user
    v_user_id := uuid_generate_v4();
    
    -- Hash the password using gen_salt and crypt
    v_encrypted_password := crypt(p_password, gen_salt('bf'));
    
    -- Step 1: Create auth user
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
        v_user_id,
        'authenticated',
        'authenticated',
        p_email,
        v_encrypted_password,
        NOW(), -- Email confirmed
        p_phone,
        NOW(), -- Phone confirmed
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object(
            'phone', p_phone, 
            'full_name', p_full_name,
            'address', p_address,
            'personal_email', p_personal_email
        ),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );
    
    -- Step 2: Create profile in users table
    INSERT INTO public.users (
        id,
        coaching_id,
        email,
        phone,
        full_name,
        exam_goal,
        role,
        status,
        address,
        personal_email,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_coaching_id,
        p_email,
        p_phone,
        p_full_name,
        p_exam_goal,
        'student',
        'active',
        p_address,
        p_personal_email,
        NOW(),
        NOW()
    );
    
    -- Step 3: Enroll in batch if provided
    IF p_batch_id IS NOT NULL THEN
        INSERT INTO public.batch_enrollments (
            user_id,
            batch_id,
            coaching_id,
            status,
            created_at
        ) VALUES (
            v_user_id,
            p_batch_id,
            p_coaching_id,
            'active',
            NOW()
        );
    END IF;
    
    -- Return success with user_id
    RETURN json_build_object(
        'success', true,
        'user_id', v_user_id,
        'email', p_email
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Rollback happens automatically
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_student_account TO authenticated;
