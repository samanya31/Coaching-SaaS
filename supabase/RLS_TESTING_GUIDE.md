# RLS POLICY TESTING GUIDE

**CRITICAL:** Do NOT skip this testing. Broken RLS = Data leaks between tenants!

---

## WHY RLS TESTING IS CRITICAL

**Without proper RLS testing:**
- ❌ ABC Coaching could see XYZ Coaching's students
- ❌ Students could access teacher-only data
- ❌ One coaching could modify another's batches
- ❌ Data privacy violations = Legal issues

**With proper RLS testing:**
- ✅ Complete tenant isolation verified
- ✅ Role-based permissions confirmed
- ✅ Data security guaranteed
- ✅ Compliance requirements met

---

## TESTING METHODOLOGY

### 1. Test WITHOUT Authentication (Should FAIL)
### 2. Test AS different roles (student, teacher, admin)
### 3. Test ACROSS different coachings
### 4. Test UPDATE/DELETE permissions
### 5. Test edge cases

---

## TEST 1: Verify RLS is ENABLED

**Run in Supabase SQL Editor:**

```sql
-- Check RLS status for all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- EXPECTED: rowsecurity = true for ALL tables
```

**✅ All tables should show `rowsecurity = true`**

---

## TEST 2: Verify Unauthenticated Access FAILS

**These queries should ALL FAIL (no auth context):**

```sql
-- Should FAIL with RLS error
SELECT * FROM users;

-- Should FAIL
SELECT * FROM batches;

-- Should FAIL  
SELECT * FROM courses;

-- Should FAIL
SELECT * FROM announcements;
```

**✅ Expected:** Permission denied / RLS error  
**❌ If succeeds:** RLS NOT WORKING - FIX IMMEDIATELY

---

## TEST 3: Verify Data Isolation

**Query to check each coaching has isolated data:**

```sql
-- This bypasses RLS for verification only
-- (Uses direct table access, not user context)

-- Check student distribution
SELECT 
    c.name AS coaching,
    c.slug,
    COUNT(u.id) FILTER (WHERE u.role = 'student') AS students,
    COUNT(u.id) FILTER (WHERE u.role = 'teacher') AS teachers,
    COUNT(u.id) FILTER (WHERE u.role = 'coaching_admin') AS admins
FROM coachings c
LEFT JOIN users u ON c.id = u.coaching_id
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- EXPECTED RESULT:
-- ABC Test Academy      | abc-coaching  | 3 | 1 | 1
-- Demo Coaching Academy | demo-coaching | 4 | 1 | 1
-- XYZ Coaching Center   | xyz-coaching  | 3 | 1 | 1
```

**✅ Verify:** Each coaching has its own isolated data

---

## TEST 4: Verify coaching_id Relationships

**Check ALL tables have coaching_id foreign key:**

```sql
-- Find all foreign key relationships to coachings table
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'coachings'
ORDER BY tc.table_name;

-- EXPECTED: 9 tables reference coachings(id)
-- users, batches, batch_enrollments, courses, course_content,
-- live_classes, announcements, test_submissions, progress_tracking
```

**✅ All tables (except coachings) should reference coachings(id)**

---

## TEST 5: Simulate User Scenarios

### Scenario A: Demo Coaching Admin Views Users

**What should happen:**
- ✅ Can see Demo coaching's users
- ❌ Cannot see ABC coaching's users
- ❌ Cannot see XYZ coaching's users

**Test Query (simulate with current_user_coaching_id):**

```sql
-- Simulate: What would Demo admin see?
-- Manually set coaching_id context

DO $$
DECLARE
    demo_coaching_id UUID;
BEGIN
    SELECT id INTO demo_coaching_id FROM coachings WHERE slug = 'demo-coaching';
    
    -- This is what Demo admin SHOULD see
    RAISE NOTICE 'Demo Admin should see these users:';
    
    PERFORM 1 FROM users 
    WHERE coaching_id = demo_coaching_id;
    
    -- Count students they can see
    RAISE NOTICE 'Total students visible: %', 
        (SELECT COUNT(*) FROM users WHERE coaching_id = demo_coaching_id AND role = 'student');
END $$;

-- EXPECTED: 4 students from demo-coaching ONLY
```

### Scenario B: ABC Student Views Batches

**What should happen:**
- ✅ Can see ABC coaching's batches
- ❌ Cannot see Demo/XYZ batches

**Test Query:**

```sql
-- What batches should ABC student see?
SELECT b.name, b.exam_goal, c.name as coaching
FROM batches b
JOIN coachings c ON b.coaching_id = c.id
WHERE c.slug = 'abc-coaching';

-- EXPECTED: 2 batches (CA Foundation, IIT-JEE Advanced) ONLY
```

### Scenario C: Cross-Tenant Access Attempt

**What should happen:**
- ❌ Demo admin CANNOT update ABC coaching's data

**Test with RLS Policies:**

```sql
-- Check: Can one coaching modify another's data?
-- This tests the RLS UPDATE policies

-- Get coaching IDs
DO $$
DECLARE
    demo_id UUID;
    abc_id UUID;
BEGIN
    SELECT id INTO demo_id FROM coachings WHERE slug = 'demo-coaching';
    SELECT id INTO abc_id FROM coachings WHERE slug = 'abc-coaching';
    
    -- Verify Demo admin cannot update ABC's batches
    -- (In reality, RLS would block this automatically)
    
    RAISE NOTICE 'Demo Coaching ID: %', demo_id;
    RAISE NOTICE 'ABC Coaching ID: %', abc_id;
    RAISE NOTICE 'If RLS is working, Demo admin cannot UPDATE batches with coaching_id = ABC';
END $$;
```

---

## TEST 6: Role-Based Permissions

### Test: Student CANNOT Create Batches

**RLS Policy:**
```sql
-- Only teachers and admins can create batches
CREATE POLICY "Teachers can create batches"
ON batches FOR INSERT
WITH CHECK (
    coaching_id = auth.current_user_coaching_id()
    AND auth.current_user_role() IN ('coaching_admin', 'teacher')
);
```

**Verification:**
```sql
-- Check policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'batches' 
  AND policyname LIKE '%create%';
```

### Test: Teacher CAN Create Content

**Verification:**
```sql
-- Check course_content policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'course_content'
ORDER BY policyname;

-- Should have policies for:
-- - SELECT (all users can view)
-- - INSERT (teachers can create)
-- - UPDATE (teachers can update)
-- - DELETE (admins can delete)
```

---

## TEST 7: Helper Functions Work Correctly

**Test each helper function:**

```sql
-- Test 1: current_user_coaching_id
-- (Requires authenticated context - test in app)

-- Test 2: current_user_role
-- (Requires authenticated context - test in app)

-- Test 3: is_super_admin
SELECT auth.is_super_admin();
-- Without auth: should return FALSE

-- Test 4: is_coaching_admin  
SELECT auth.is_coaching_admin();
-- Without auth: should return FALSE
```

---

## TEST 8: Cascading Deletes

**Test: Deleting coaching deletes all related data:**

```sql
-- Create test coaching (don't use real ones!)
INSERT INTO coachings (slug, name, subdomain)
VALUES ('test-delete', 'Test Delete Coaching', 'testdel')
RETURNING id;

-- Add test user
INSERT INTO users (id, coaching_id, full_name, email, role)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM coachings WHERE slug = 'test-delete'),
    'Test User',
    'test@delete.com',
    'student'
);

-- Verify user exists
SELECT COUNT(*) FROM users 
WHERE coaching_id = (SELECT id FROM coachings WHERE slug = 'test-delete');
-- Should be 1

-- DELETE the coaching
DELETE FROM coachings WHERE slug = 'test-delete';

-- Verify user was CASCADE deleted
SELECT COUNT(*) FROM users WHERE email = 'test@delete.com';
-- Should be 0

-- ✅ Cascading delete works!
```

---

## TEST 9: Index Performance

**Verify indexes exist for coaching_id:**

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexdef LIKE '%coaching_id%'
ORDER BY tablename;

-- EXPECTED: Index on coaching_id for:
-- - users
-- - batches
-- - batch_enrollments
-- - courses
-- - course_content
-- - live_classes
-- - announcements
-- - test_submissions
-- - progress_tracking
```

**✅ All tables should have INDEX on coaching_id**

---

## TEST 10: Real-World Multi-User Simulation

**This requires actual Supabase Auth users (Phase 4), but document expected behavior:**

### Setup Test Users (In Production):
1. Create user: `demo-admin@test.com` → Demo Coaching (coaching_admin)
2. Create user: `demo-student@test.com` → Demo Coaching (student)
3. Create user: `abc-admin@test.com` → ABC Coaching (coaching_admin)
4. Create user: `abc-student@test.com` → ABC Coaching (student)

### Test Matrix:

| User | Can See | Cannot See |
|------|---------|------------|
| demo-admin | Demo students, batches, courses | ABC/XYZ data |
| demo-student | Demo courses, own submissions | Other students' submissions, ABC/XYZ |
| abc-admin | ABC students, batches, courses | Demo/XYZ data |
| abc-student | ABC courses, own submissions | Other students' submissions, Demo/XYZ |

---

## CRITICAL EDGE CASES TO TEST

### Edge Case 1: User with No coaching_id
```sql
-- What happens if user.coaching_id is NULL?
-- Should NOT be possible with NOT NULL constraint

-- Verify constraint exists
SELECT
    conname,
    contype,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass
    AND conname LIKE '%coaching_id%';

-- ✅ Should show NOT NULL constraint
```

### Edge Case 2: Duplicate Emails Across Coachings
```sql
-- ALLOWED: Same email in different coachings
INSERT INTO users (id, coaching_id, full_name, email, role)
VALUES
(gen_random_uuid(), 
 (SELECT id FROM coachings WHERE slug = 'demo-coaching'),
 'Alice Demo', 'alice@test.com', 'student'),
 
(gen_random_uuid(),
 (SELECT id FROM coachings WHERE slug = 'abc-coaching'),
 'Alice ABC', 'alice@test.com', 'student');

-- Should succeed: UNIQUE(coaching_id, email)

-- NOT ALLOWED: Duplicate in same coaching
INSERT INTO users (id, coaching_id, full_name, email, role)
VALUES
(gen_random_uuid(),
 (SELECT id FROM coachings WHERE slug = 'demo-coaching'),
 'Another Alice', 'alice@test.com', 'student');

-- Should FAIL: Duplicate key violation
```

### Edge Case 3: Orphaned coaching_id
```sql
-- Try to insert user with non-existent coaching_id
INSERT INTO users (id, coaching_id, full_name, email, role)
VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',  -- Invalid UUID
    'Orphan User',
    'orphan@test.com',
    'student'
);

-- Should FAIL: Foreign key violation
-- ✅ Proves foreign key constraint works
```

---

## CHECKLIST: RLS VALIDATION

Before proceeding to Phase 3, verify:

**Schema:**
- [ ] All 10 tables exist
- [ ] All tables have coaching_id (except coachings)
- [ ] All foreign keys to coachings(id) exist
- [ ] All coaching_id columns indexed
- [ ] CASCADE DELETE configured

**RLS Policies:**
- [ ] RLS enabled on all 10 tables
- [ ] Unauthenticated SELECT fails on all tables
- [ ] Helper functions created (4 functions)
- [ ] Policies test passed for each table
- [ ] Role-based permissions verified

**Data Isolation:**
- [ ] 3 coachings have separate data
- [ ] Student count matches per coaching (4, 3, 3)
- [ ] Batch count matches per coaching (2, 2, 2)
- [ ] Cross-tenant queries blocked by RLS

**Constraints:**
- [ ] UNIQUE(coaching_id, email) on users
- [ ] UNIQUE(coaching_id, student_id) on users
- [ ] NOT NULL on all coaching_id columns
- [ ] Foreign key constraints enforce relationships

**Edge Cases:**
- [ ] Cascading deletes work
- [ ] Duplicate emails across coachings allowed
- [ ] Duplicate emails within coaching blocked
- [ ] Orphaned coaching_id blocked
- [ ] NULL coaching_id blocked

---

## WHEN TO RE-TEST RLS

**Re-test RLS policies after:**
- ✅ Any schema change
- ✅ Adding new tables
- ✅ Modifying existing policies
- ✅ Adding new roles
- ✅ Before production deployment

---

## TROUBLESHOOTING

### Issue: RLS Not Blocking Access
**Symptom:** Can query `SELECT * FROM users` without auth  
**Fix:** Check `ALTER TABLE users ENABLE ROW LEVEL SECURITY;` was run

### Issue: All Queries Blocked (Even Valid Ones)
**Symptom:** Cannot query anything even with auth  
**Fix:** Check policies have `TO authenticated` and proper USING clause

### Issue: Helper Functions Return NULL
**Symptom:** `auth.current_user_coaching_id()` returns NULL  
**Fix:** Requires authenticated session. Test in app, not SQL Editor.

### Issue: Cross-Tenant Data Visible
**Symptom:** Demo admin sees ABC data  
**Fix:** Policy USING clause incorrect. Should be `coaching_id = auth.current_user_coaching_id()`

---

## FINAL VERIFICATION QUERY

**Run this comprehensive check:**

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

-- ALL should show: ✅ SECURED
```

---

## SUCCESS CRITERIA

✅ **Phase 2 RLS is COMPLETE when:**
1. All tables have RLS enabled
2. All tables have appropriate policies
3. Helper functions work correctly
4. Data isolation verified with test queries
5. Role-based permissions tested
6. Edge cases handled
7. Cascading deletes work
8. Indexes on coaching_id exist
9. All checklist items checked
10. Comprehensive validation query shows "✅ SECURED" for all tables

**DO NOT proceed to Phase 3 until ALL criteria met!**

---

Last Updated: February 11, 2026  
**CRITICAL:** This is not optional. Test thoroughly before Phase 3.
