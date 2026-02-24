-- Migration 027: Staff and Role Management
-- Purpose: Support dynamic role creation and automatic user sync from Auth

BEGIN;

-- 1. Create ROLES table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID REFERENCES coachings(id) ON DELETE CASCADE, -- Nullable for system roles
    name TEXT NOT NULL,
    code TEXT NOT NULL, -- e.g., 'senior_teacher', 'accountant'
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coaching_id, code),
    UNIQUE(coaching_id, name)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_roles_coaching_id ON roles(coaching_id);

-- 2. Update USERS table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- 3. Create Function to Handle New User (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    target_coaching_id UUID;
    target_role TEXT;
    target_role_id UUID;
    full_name TEXT;
    target_metadata JSONB;
BEGIN
    -- Extract metadata from the auth user
    -- Supabase Auth metadata is stored in raw_user_meta_data
    target_coaching_id := (new.raw_user_meta_data->>'coaching_id')::UUID;
    target_role := new.raw_user_meta_data->>'role';
    target_role_id := (new.raw_user_meta_data->>'role_id')::UUID;
    full_name := new.raw_user_meta_data->>'full_name';
    target_metadata := new.raw_user_meta_data;

    -- Default fallback if missing
    IF full_name IS NULL THEN
        full_name := 'New User';
    END IF;

    -- Only insert if coaching_id is present (avoids issues with random signups if public signup is enabled)
    IF target_coaching_id IS NOT NULL THEN
        INSERT INTO public.users (
            id, 
            coaching_id, 
            full_name, 
            email, 
            role, -- Legacy support
            role_id, -- New support
            status,
            metadata
        )
        VALUES (
            new.id,
            target_coaching_id,
            full_name,
            new.email,
            COALESCE(target_role, 'student'), -- Default to student if not specified
            target_role_id,
            'active',
            target_metadata
        )
        ON CONFLICT (id) DO UPDATE SET
            coaching_id = EXCLUDED.coaching_id,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            role_id = EXCLUDED.role_id,
            metadata = EXCLUDED.metadata;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger on auth.users
-- Drop first to be safe (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable RLS on Roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Allow Admins to view/create/update/delete roles
CREATE POLICY "Admins can manage roles" ON roles
    FOR ALL
    USING (
        coaching_id = public.current_user_coaching_id() 
        AND public.current_user_role() IN ('coaching_admin', 'super_admin')
    );

-- Allow everyone to view system roles or their coaching's roles
CREATE POLICY "Users can view relevant roles" ON roles
    FOR SELECT
    USING (
        coaching_id = public.current_user_coaching_id() 
        OR is_system = TRUE
    );

COMMIT;
