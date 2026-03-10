SELECT 
    pol.polname as policy_name,
    pol.polcmd as command,
    pol.polroles as roles,
    pg_get_expr(pol.polqual, pol.polrelid) as USING_expr,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as WITH_CHECK_expr
FROM pg_policy pol
JOIN pg_class tc ON pol.polrelid = tc.oid
JOIN pg_namespace nsp ON tc.relnamespace = nsp.oid
WHERE tc.relname = 'study_materials' AND nsp.nspname = 'public';
