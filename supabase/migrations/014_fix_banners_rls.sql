-- Fix RLS policies for banners table using a SECURITY DEFINER function
-- This bypasses RLS recursion issues by running the admin check with elevated privileges

-- 1. Create a secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view all banners" ON banners;
DROP POLICY IF EXISTS "Public can view active banners" ON banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON banners;
DROP POLICY IF EXISTS "Admins can update banners" ON banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON banners;

-- 3. Re-enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- 4. Public Access Policy
CREATE POLICY "Public can view active banners"
    ON banners FOR SELECT
    USING (is_active = true);

-- 5. Admin Access Policies (Using the secure function)

-- READ
CREATE POLICY "Admins can view all banners"
    ON banners FOR SELECT
    USING (public.is_admin());

-- INSERT
CREATE POLICY "Admins can insert banners"
    ON banners FOR INSERT
    WITH CHECK (public.is_admin());

-- UPDATE
CREATE POLICY "Admins can update banners"
    ON banners FOR UPDATE
    USING (public.is_admin());

-- DELETE
CREATE POLICY "Admins can delete banners"
    ON banners FOR DELETE
    USING (public.is_admin());

-- 6. Ensure the function is executable
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 7. Grant access to the table
GRANT ALL ON public.banners TO postgres;
GRANT ALL ON public.banners TO service_role;
GRANT ALL ON public.banners TO authenticated;
GRANT SELECT ON public.banners TO anon;
