-- Debug Script to Check RLS Context
-- Run this in the Supabase SQL Editor and check the results in the "Results" tab.

SELECT 
    auth.uid() as "My Auth ID",
    (SELECT email FROM auth.users WHERE id = auth.uid()) as "My Email",
    (SELECT role FROM public.users WHERE id = auth.uid()) as "My Role (Public)",
    (SELECT coaching_id FROM public.users WHERE id = auth.uid()) as "My Coaching ID (Public)",
    public.current_user_role() as "Function: current_user_role()",
    public.current_user_coaching_id() as "Function: current_user_coaching_id()",
    (SELECT id FROM coachings WHERE slug = 'demo-coaching') as "Demo Coaching ID";
