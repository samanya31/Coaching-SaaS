-- =====================================================
-- MIGRATION 001: INITIAL SCHEMA (Hardened)
-- =====================================================
-- Date: February 12, 2026
-- Purpose: Create core multi-tenant tables
-- Improvements: updated_at triggers, idempotent checks
-- =====================================================

-- 1. UTILITY FUNCTIONS (For Triggers)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 2. TABLE DEFINITIONS
-- =====================================================

-- TABLE: COACHINGS
CREATE TABLE IF NOT EXISTS coachings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#4F46E5',
    secondary_color TEXT DEFAULT '#7C3AED',
    template_id TEXT DEFAULT 'default',
    features JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    plan TEXT DEFAULT 'free',
    plan_limits JSONB DEFAULT '{"max_students": 50, "max_teachers": 5, "max_courses": 10}',
    subscription_status TEXT DEFAULT 'active',
    subscription_ends_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_coachings_slug ON coachings(slug);
CREATE INDEX IF NOT EXISTS idx_coachings_domain ON coachings(domain);
CREATE INDEX IF NOT EXISTS idx_coachings_subdomain ON coachings(subdomain);
CREATE INDEX IF NOT EXISTS idx_coachings_status ON coachings(status);

-- TABLE: USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL,
    permissions JSONB DEFAULT '[]',
    student_id TEXT,
    exam_goal TEXT,
    registration_date TIMESTAMPTZ,
    specialization TEXT[],
    bio TEXT,
    status TEXT DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coaching_id, email),
    UNIQUE(coaching_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_users_coaching_id ON users(coaching_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- TABLE: BATCHES
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    exam_goal TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    schedule JSONB,
    max_students INTEGER,
    current_students INTEGER DEFAULT 0,
    fee_amount DECIMAL(10,2),
    fee_currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_batches_coaching_id ON batches(coaching_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);

-- TABLE: BATCH_ENROLLMENTS
CREATE TABLE IF NOT EXISTS batch_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    UNIQUE(batch_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_batch_enrollments_coaching_id ON batch_enrollments(coaching_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_batch_id ON batch_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_enrollments_user_id ON batch_enrollments(user_id);

-- TABLE: COURSES
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT,
    exam_goal TEXT,
    duration_hours INTEGER,
    total_videos INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    price DECIMAL(10,2),
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_courses_coaching_id ON courses(coaching_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- TABLE: COURSE_CONTENT
CREATE TABLE IF NOT EXISTS course_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    media_url TEXT,
    duration_seconds INTEGER,
    file_size_mb DECIMAL(10,2),
    test_data JSONB,
    section TEXT,
    order_index INTEGER,
    is_free BOOLEAN DEFAULT FALSE,
    unlock_after_days INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_content_coaching_id ON course_content(coaching_id);
CREATE INDEX IF NOT EXISTS idx_course_content_course_id ON course_content(course_id);

-- TABLE: LIVE_CLASSES
CREATE TABLE IF NOT EXISTS live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    platform TEXT,
    meeting_link TEXT,
    meeting_id TEXT,
    passcode TEXT,
    recording_url TEXT,
    instructor_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_classes_coaching_id ON live_classes(coaching_id);

-- TABLE: ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    target_role TEXT[],
    target_batch_ids UUID[],
    is_pinned BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_announcements_coaching_id ON announcements(coaching_id);

-- TABLE: TEST_SUBMISSIONS
CREATE TABLE IF NOT EXISTS test_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES course_content(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score INTEGER,
    max_score INTEGER,
    percentage DECIMAL(5,2),
    time_taken_seconds INTEGER,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_test_submissions_coaching_id ON test_submissions(coaching_id);
CREATE INDEX IF NOT EXISTS idx_test_submissions_user_id ON test_submissions(user_id);

-- TABLE: PROGRESS_TRACKING
CREATE TABLE IF NOT EXISTS progress_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coaching_id UUID NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES course_content(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    progress_percentage INTEGER DEFAULT 0,
    last_watched_position INTEGER,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_tracking_coaching_id ON progress_tracking(coaching_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON progress_tracking(user_id);

-- =====================================================
-- 3. APPLY TRIGGERS (Auto-update updated_at)
-- =====================================================

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
        EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
    END LOOP;
END $$;
