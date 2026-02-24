# ⚠️ CRITICAL: RLS TESTING REQUIRED

**BEFORE proceeding to Phase 3, you MUST verify RLS policies!**

---

## Why This Matters

**Broken RLS = Data Leaks:**
- ABC Coaching could see XYZ Coaching's students ❌
- Students could access teacher data ❌
- One tenant could modify another's data ❌
- GDPR/privacy violations = Legal issues ❌

---

## Required Actions

### 1. Setup Supabase
Follow `supabase/SETUP_GUIDE.md`:
- Create Supabase project
- Run 3 SQL migrations
- Create `.env.local`

### 2. **CRITICAL: Test RLS Policies**
Follow `supabase/RLS_TESTING_GUIDE.md`:
- Verify RLS enabled on all tables
- Test data isolation
- Test role-based permissions
- Test edge cases
- Run comprehensive validation query

### 3. Verify Multi-Tenancy
Test with URLs:
- `?tenant=demo-coaching` → Demo Coaching Academy
- `?tenant=abc-coaching` → ABC Test Academy
- `?tenant=xyz-coaching` → XYZ Coaching Center

---

## RLS Testing Checklist

**Schema Validation:**
- [ ] All 10 tables exist
- [ ] All tables have `coaching_id` (except coachings)
- [ ] Foreign keys to `coachings(id)` exist
- [ ] Indexes on `coaching_id` exist
- [ ] CASCADE DELETE configured

**RLS Policies:**
- [ ] RLS enabled on ALL 10 tables
- [ ] Unauthenticated SELECT fails
- [ ] Helper functions created (4 functions)
- [ ] SELECT policies tested
- [ ] INSERT policies tested
- [ ] UPDATE policies tested
- [ ] DELETE policies tested

**Data Isolation:**
- [ ] 3 coachings have separate data
- [ ] Cross-tenant queries blocked
- [ ] Student count: Demo=4, ABC=3, XYZ=3
- [ ] Batch count: 2 per coaching

**Edge Cases:**
- [ ] Cascading deletes work
- [ ] Duplicate emails across coachings allowed
- [ ] Duplicate emails within coaching blocked
- [ ] NULL coaching_id blocked
- [ ] Orphaned coaching_id blocked

**Final Validation:**
- [ ] Ran comprehensive validation query
- [ ] All tables show "✅ SECURED"
- [ ] Read RLS_TESTING_GUIDE.md completely
- [ ] Tested multi-user scenarios

---

## DO NOT Skip This

**These tests are NOT optional!**

RLS is the ONLY thing preventing:
- Data leaks between tenants
- Unauthorized access
- Privacy violations
- Security breaches

**Time Required:** 30-60 minutes of testing  
**Risk if skipped:** CRITICAL security vulnerability

---

## Next Steps

**ONLY after ALL RLS tests pass:**
✅ Proceed to Phase 3: Tenant-Aware Services

**If ANY RLS test fails:**
❌ FIX IMMEDIATELY before continuing

---

## Quick Validation

**Run this in Supabase SQL Editor:**

```sql
-- COMPREHENSIVE RLS VALIDATION
WITH table_checks AS (
    SELECT 
        tablename,
        (SELECT COUNT(*) FROM pg_policies 
         WHERE pg_policies.tablename = pt.tablename) as policy_count,
        rowsecurity::text as rls_enabled
    FROM pg_tables pt
    WHERE schemaname = 'public'
        AND tablename IN (
            'coachings', 'users', 'batches', 'batch_enrollments',
            'courses', 'course_content', 'live_classes', 
            'announcements', 'test_submissions', 'progress_tracking'
        )
)
SELECT 
    tablename,
    policy_count,
    rls_enabled,
    CASE 
        WHEN rls_enabled = 'true' AND policy_count > 0 THEN '✅ SECURED'
        WHEN rls_enabled = 'false' THEN '❌ RLS DISABLED'
        WHEN policy_count = 0 THEN '⚠️ NO POLICIES'
        ELSE '❓ UNKNOWN'
    END as status
FROM table_checks
ORDER BY tablename;
```

**Expected:** ALL tables show `✅ SECURED`

---

## Files to Read

1. **`SETUP_GUIDE.md`** - Supabase setup instructions
2. **`RLS_TESTING_GUIDE.md`** - Complete RLS testing (CRITICAL!)
3. **`updates/phase2.txt`** - What was done in Phase 2

---

**Remember: RLS testing is NOT optional. It's the difference between a secure multi-tenant SaaS and a data leak waiting to happen!**
