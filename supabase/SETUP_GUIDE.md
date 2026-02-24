# SUPABASE SETUP GUIDE - Phase 2

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Organization:** Select or create
   - **Name:** exam-edge-coaching
   - **Database Password:** [Generate strong password - SAVE IT!]
   - **Region:** Choose closest to you
4. Click "Create new project"
5. **Wait ~2 minutes** for provisioning

---

## Step 2: Get API Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** Long JWT token starting with `eyJh...`

3. Create `.env.local` in your project root:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**IMPORTANT:** Add `.env.local` to `.gitignore` (should already be there)

---

## Step 3: Run SQL Migrations

### Migration 1: Schema
1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New query"  
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL

 editor
5. Click **Run** (or F5)
6. **Wait for success message** ✅

### Migration 2: RLS Policies
1. Click "New query" again
2. Copy contents of `supabase/migrations/002_rls_policies.sql`
3. Paste and **Run**
4. **Wait for success message** ✅

### Migration 3: Seed Data
1. Click "New query" again
2. Copy contents of `supabase/migrations/003_seed_data.sql`
3. Paste and **Run**
4. **Wait for success message** ✅

---

## Step 4: Verify Setup

### Check Tables Created
1. Go to **Table Editor**
2. You should see 10 tables:
   - ✅ coachings
   - ✅ users
   - ✅ batches
   - ✅ batch_enrollments
   - ✅ courses
   - ✅ course_content
   - ✅ live_classes
   - ✅ announcements
   - ✅ test_submissions
   - ✅ progress_tracking

### Check Coachings
1. Click `coachings` table
2. You should see **3 rows:**
   - demo-coaching (Demo Coaching Academy)
   - abc-coaching (ABC Test Academy)
   - xyz-coaching (XYZ Coaching Center)

### Check Users
1. Click `users` table
2. You should see **10 students** across 3 coachings

### Verify RLS is Active
1. Go to **SQL Editor**
2. Run this query:
```sql
SELECT * FROM users;
```
3. **Should FAIL** with error (this is good! RLS is working)

4. Now run this to see data distribution:
```sql
SELECT c.name, COUNT(u.id) as student_count
FROM coachings c
LEFT JOIN users u ON c.id = u.coaching_id
GROUP BY c.id, c.name
ORDER BY c.name;
```

**Expected Result:**
```
ABC Test Academy      | 3
Demo Coaching Academy | 4  
XYZ Coaching Center   | 3
```

---

## Step 5: Test App Connection

1. Make sure `.env.local` is created with your credentials
2. Restart dev server:
```bash
npm run dev
```

3. Open browser: `http://localhost:5173?tenant=demo-coaching`

4. Check browser console:
   - Should see: `[TenantProvider] Detecting tenant: demo-coaching`
   - Should see: `[TenantProvider] Loaded coaching: Demo Coaching Academy`

5. If you see errors:
   - Check `.env.local` file exists
   - Check Supabase credentials are correct
   - Check migrations ran successfully

---

## Step 6: Test Multi-Tenancy

### Test 1: Demo Coaching
URL: `http://localhost:5173?tenant=demo-coaching`
- Should load Demo Coaching Academy
- Console should show coaching name

### Test 2: ABC Coaching
URL: `http://localhost:5173?tenant=abc-coaching`
- Should load ABC Test Academy
- Should show different coaching

### Test 3: XYZ Coaching
URL: `http://localhost:5173?tenant=xyz-coaching`
- Should load XYZ Coaching Center
- Should show different coaching

### Test 4: Invalid Tenant
URL: `http://localhost:5173?tenant=nonexistent`
- Should show error page: "Coaching Not Found"

---

## Troubleshooting

### Error: "Failed to create client"
- ✅ Check `.env.local` exists
- ✅ Check `VITE_` prefix on variables
- ✅ Restart dev server after creating `.env.local`

### Error: "relation does not exist"
- ✅ Run migrations in Supabase SQL Editor
- ✅ Check all 3 migration files executed successfully

### Error: "Coaching not found"
- ✅ Check seed data ran
- ✅ Verify `coachings` table has 3 rows
- ✅ Check `?tenant=` parameter matches slug in database

### RLS Not Working
- ✅ Run migration `002_rls_policies.sql`
- ✅ Check "Enable RLS" is turned on for all tables
- ✅ Go to Table Editor → Click table → Policies tab

---

## Next Steps

Once setup complete:
- ✅ Phase 2 complete
- ✅ Database ready
- ✅ Tenant detection working
- ✅ RLS enforcing data isolation

**Ready for Phase 3:** Tenant-Aware Services & Hooks

---

## Quick Reference

**Demo URLs:**
- `localhost:5173?tenant=demo-coaching`
- `localhost:5173?tenant=abc-coaching`
- `localhost:5173?tenant=xyz-coaching`

**Supabase Dashboard:**
- Tables: Table Editor
- SQL: SQL Editor  
- Auth: Authentication
- Storage: Storage

**Check Data:**
```sql
-- View all coachings
SELECT * FROM coachings;

-- View students per coaching
SELECT c.name, u.full_name, u.student_id
FROM coachings c
JOIN users u ON c.id = u.coaching_id
WHERE u.role = 'student'
ORDER BY c.name, u.student_id;
```
