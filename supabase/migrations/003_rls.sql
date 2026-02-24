-- =====================================================
-- MIGRATION 003: RLS POLICIES (Hardened)
-- =====================================================
-- Date: February 12, 2026
-- Purpose: Enforce tenant isolation & role-based access
-- Improvements: Using public functions, Full CRUD coverage
-- =====================================================

-- 1. ENABLE RLS
ALTER TABLE coachings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

-- 2. COACHINGS POLICIES
-- Anon read for tenant lookup (CRITICAL)
CREATE POLICY "Public tenant lookup" ON coachings FOR SELECT TO anon USING (status = 'active');
-- Auth read for own coaching
CREATE POLICY "Users view own coaching" ON coachings FOR SELECT TO authenticated USING (id = public.current_user_coaching_id());
-- Super admin read all
CREATE POLICY "Super admin view all" ON coachings FOR SELECT TO authenticated USING (public.is_super_admin());
-- Admin update own
CREATE POLICY "Admin update own" ON coachings FOR UPDATE TO authenticated USING (id = public.current_user_coaching_id() AND public.is_coaching_admin());

-- 3. USERS POLICIES
-- View users in same coaching
CREATE POLICY "View coaching users" ON users FOR SELECT TO authenticated USING (coaching_id = public.current_user_coaching_id());
-- View own profile
CREATE POLICY "View own profile" ON users FOR SELECT TO authenticated USING (id = auth.uid());
-- Admin manage users
CREATE POLICY "Admin insert users" ON users FOR INSERT TO authenticated WITH CHECK (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin());
CREATE POLICY "Admin update users" ON users FOR UPDATE TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin());
CREATE POLICY "Admin delete users" ON users FOR DELETE TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin());
-- User update own profile
CREATE POLICY "Update own profile" ON users FOR UPDATE TO authenticated USING (id = auth.uid());

-- 4. BATCHES POLICIES
-- View batches
CREATE POLICY "View batches" ON batches FOR SELECT TO authenticated USING (coaching_id = public.current_user_coaching_id());
-- Manage batches (Admin/Teacher)
CREATE POLICY "Staff insert batches" ON batches FOR INSERT TO authenticated WITH CHECK (coaching_id = public.current_user_coaching_id() AND public.is_staff());
CREATE POLICY "Staff update batches" ON batches FOR UPDATE TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_staff());
CREATE POLICY "Admin delete batches" ON batches FOR DELETE TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin());

-- 5. BATCH ENROLLMENTS POLICIES
-- View enrollments
CREATE POLICY "View enrollments" ON batch_enrollments FOR SELECT TO authenticated USING (coaching_id = public.current_user_coaching_id());
-- Manage enrollments (Admin only)
CREATE POLICY "Admin manage enrollments" ON batch_enrollments FOR ALL TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin());

-- 6. COURSES POLICIES
-- View courses
CREATE POLICY "View courses" ON courses FOR SELECT TO authenticated USING (coaching_id = public.current_user_coaching_id());
-- Manage courses (Staff)
CREATE POLICY "Staff insert courses" ON courses FOR INSERT TO authenticated WITH CHECK (coaching_id = public.current_user_coaching_id() AND public.is_staff());
CREATE POLICY "Staff update courses" ON courses FOR UPDATE TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_staff());
CREATE POLICY "Admin delete courses" ON courses FOR DELETE TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_coaching_admin());

-- 7. COURSE CONTENT POLICIES
-- View content
CREATE POLICY "View content" ON course_content FOR SELECT TO authenticated USING (coaching_id = public.current_user_coaching_id());
-- Manage content (Staff)
CREATE POLICY "Staff manage content" ON course_content FOR ALL TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_staff());

-- 8. LIVE CLASSES POLICIES
-- View classes
CREATE POLICY "View live classes" ON live_classes FOR SELECT TO authenticated USING (coaching_id = public.current_user_coaching_id());
-- Manage classes (Staff)
CREATE POLICY "Staff manage live classes" ON live_classes FOR ALL TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_staff());

-- 9. ANNOUNCEMENTS POLICIES
-- View announcements
CREATE POLICY "View announcements" ON announcements FOR SELECT TO authenticated USING (coaching_id = public.current_user_coaching_id());
-- Manage announcements (Staff)
CREATE POLICY "Staff manage announcements" ON announcements FOR ALL TO authenticated USING (coaching_id = public.current_user_coaching_id() AND public.is_staff());

-- 10. TEST SUBMISSIONS
-- View own or staff view all
CREATE POLICY "View submissions" ON test_submissions FOR SELECT TO authenticated USING (user_id = auth.uid() OR (coaching_id = public.current_user_coaching_id() AND public.is_staff()));
-- Submit test (Student)
CREATE POLICY "Submit test" ON test_submissions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND coaching_id = public.current_user_coaching_id());

-- 11. PROGRESS TRACKING
-- View own or staff view all
CREATE POLICY "View progress" ON progress_tracking FOR SELECT TO authenticated USING (user_id = auth.uid() OR (coaching_id = public.current_user_coaching_id() AND public.is_staff()));
-- Update own
CREATE POLICY "Update progress" ON progress_tracking FOR ALL TO authenticated USING (user_id = auth.uid());
