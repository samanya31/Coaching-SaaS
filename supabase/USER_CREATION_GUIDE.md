# USER CREATION GUIDE - Multi-Tenant SaaS

## 🔐 Understanding the Architecture

Your schema is **production-correct**:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    coaching_id UUID NOT NULL REFERENCES coachings(id),
    ...
)
```

This means:
- ✅ **Production-safe**: Users must authenticate via Supabase Auth
- ✅ **Secure**: Can't create fake users without real auth
- ❌ **Testing restriction**: Can't seed users with random UUIDs

---

## ✅ Fixed Seed Data (Phase 2)

**`003_seed_data_FIXED.sql`** now creates:
- ✅ 3 Coaching institutes
- ✅ 6 Batches (2 per coaching)
- ✅ 8 Courses
- ✅ 6 Announcements
- ❌ NO users (requires real auth)

**This is correct for production architecture!**

---

## 👥 How to Add Users (2 Methods)

### Method 1: Supabase Dashboard (Easiest for Testing)

1. **Go to Supabase Dashboard**
2. **Authentication** → **Users** → **Add user**
3. Fill in:
   - Email: `admin@demo.com`
   - Password: `Password123!`
   - Email Confirm: ✅ Auto confirm
4. Click **Create user**
5. **Copy the User ID** (UUID shown after creation)

6. **Go to SQL Editor**, run:
```sql
-- Get coaching ID
SELECT id FROM coachings WHERE slug = 'demo-coaching';

-- Insert into public.users (use IDs from above)
INSERT INTO users (id, coaching_id, full_name, email, role, status)
VALUES (
    '< paste user ID from step 5>',
    '<paste coaching ID>',
    'Demo Admin',
    'admin@demo.com',
    'coaching_admin',
    'active'
);
```

---

### Method 2: Code (Phase 3+ - Frontend Integration)

```typescript
// 1. Sign up user via Supabase Auth
const { data: authData, error } = await supabase.auth.signUp({
  email: 'student@demo.com',
  password: 'SecurePassword123!',
});

if (authData.user) {
  // 2. Insert into public.users with coaching association
  await supabase.from('users').insert({
    id: authData.user.id,  // Same ID from auth.users
    coaching_id: coachingId,  // From TenantProvider
    full_name: 'John Doe',
    email: 'student@demo.com',
    role: 'student',
    student_id: 'DEMO001',
    exam_goal: 'JEE'
  });
}
```

---

## 🧪 Testing Multi-Tenancy WITHOUT Users (Phase 2)

You CAN test multi-tenancy now with:
- ✅ Coaching institutes (3 created)
- ✅ Batches per coaching
- ✅ Courses per coaching
- ✅ Announcements per coaching

**Verification queries:**
```sql
-- Check coaching distribution
SELECT c.name, COUNT(b.id) as batches, COUNT(cr.id) as courses
FROM coachings c
LEFT JOIN batches b ON c.id = b.coaching_id
LEFT JOIN courses cr ON c.id = cr.coaching_id
GROUP BY c.name;

-- Expected result:
-- Demo Coaching Academy | 2 | 3
-- ABC Test Academy      | 2 | 2
-- XYZ Coaching Center   | 2 | 3
```

---

## 🚀 Phase 3: Real User Integration

In Phase 3, we'll create:
- User signup/login flows
- Auto-link users to coaching during signup
- Onboarding wizard for new coaching institutes
- Admin user creation within coaching

**For now, Phase 2 tests multi-tenancy at data level without users!**

---

## 📊 Data Verification (After Running Fixed Seed)

**Run in Supabase SQL Editor:**

```sql
-- Verify 3 coachings created
SELECT slug, name, plan FROM coachings;

-- Verify batches distributed correctly
SELECT c.name as coaching, b.name as batch
FROM coachings c
JOIN batches b ON c.id = b.coaching_id
ORDER BY c.name;

-- Verify courses distributed correctly
SELECT c.name as coaching, cr.title as course
FROM coachings c
JOIN courses cr ON c.id = cr.coaching_id
ORDER BY c.name, cr.title;

-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**All should show proper data isolation!**

---

## ⚠️ Important Notes

1. **Don't remove the FK to auth.users** - It's production-correct
2. **Don't manually insert random UUIDs into users** - Will always fail
3. **Use Supabase Auth for all user creation** - Maintains integrity
4. **Seed data focuses on coaching/content** - Users come from auth flow

---

## ✅ Phase 2 Complete When:

- [x] 3 coaching institutes created
- [x] Batches/courses distributed per coaching
- [x] RLS policies active
- [x] Tenant isolation verified (queries above pass)
- [ ] Optional: 1-2 test users created via Dashboard (for Phase 3 prep)

**You can proceed to Phase 3 without users - they'll be added during auth implementation!**
