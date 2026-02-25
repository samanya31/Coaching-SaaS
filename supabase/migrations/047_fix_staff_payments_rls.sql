-- Migration 047: Fix staff_payments RLS
-- Purpose: Ensure coaching admins can create/update/delete staff payments
--          and staff can view their own payments without 403 errors.
-- Depends on helper functions in 002_functions.sql:
--   public.current_user_coaching_id()
--   public.is_coaching_admin()
--   public.is_staff()

BEGIN;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage staff payments" ON staff_payments;
DROP POLICY IF EXISTS "Staff can view own payments" ON staff_payments;

-- Admin / management policy: full access within their coaching
CREATE POLICY "Admins can manage staff payments"
ON staff_payments
FOR ALL
TO authenticated
USING (
    (
        coaching_id = public.current_user_coaching_id()
        AND public.is_coaching_admin()
    )
    OR public.is_super_admin()
)
WITH CHECK (
    (
        coaching_id = public.current_user_coaching_id()
        AND public.is_coaching_admin()
    )
    OR public.is_super_admin()
);

-- Staff policy: can view their own payments
CREATE POLICY "Staff can view own payments"
ON staff_payments
FOR SELECT
TO authenticated
USING (
    staff_id = auth.uid()
    AND public.is_staff()
);

COMMIT;

