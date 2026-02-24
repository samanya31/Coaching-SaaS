-- =====================================================
-- MIGRATION 042: STORAGE BUCKETS FOR BRANDING & AVATARS
-- =====================================================
-- Date: 2026-02-23
-- Purpose: Create storage buckets for coaching logos
--          and student profile photos.
-- =====================================================

-- 1. Create "coaching-logos" bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'coaching-logos',
    'coaching-logos',
    true,
    1242880, -- 1MB max
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create "student-avatars" bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-avatars',
    'student-avatars',
    true,
    2145728, -- 2MB max
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RLS POLICIES FOR coaching-logos bucket
-- =====================================================

-- Public read access for coaching logos
DROP POLICY IF EXISTS "Public can read coaching logos" ON storage.objects;
CREATE POLICY "Public can read coaching logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'coaching-logos');

-- Authenticated users (admins) can upload coaching logos
DROP POLICY IF EXISTS "Admins can upload coaching logos" ON storage.objects;
CREATE POLICY "Admins can upload coaching logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'coaching-logos');

-- Authenticated users (admins) can update coaching logos
DROP POLICY IF EXISTS "Admins can update coaching logos" ON storage.objects;
CREATE POLICY "Admins can update coaching logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'coaching-logos');

-- Authenticated users (admins) can delete coaching logos
DROP POLICY IF EXISTS "Admins can delete coaching logos" ON storage.objects;
CREATE POLICY "Admins can delete coaching logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'coaching-logos');

-- =====================================================
-- RLS POLICIES FOR student-avatars bucket
-- =====================================================

-- Public read access for student avatars
DROP POLICY IF EXISTS "Public can read student avatars" ON storage.objects;
CREATE POLICY "Public can read student avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'student-avatars');

-- Students can upload their own avatar (path convention: student-avatars/{userId}/*)
DROP POLICY IF EXISTS "Students can upload own avatar" ON storage.objects;
CREATE POLICY "Students can upload own avatar"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'student-avatars');

-- Students can update their own avatar
DROP POLICY IF EXISTS "Students can update own avatar" ON storage.objects;
CREATE POLICY "Students can update own avatar"
    ON storage.objects FOR UPDATE
    TO anon, authenticated
    USING (bucket_id = 'student-avatars');

-- Students can delete their own avatar
DROP POLICY IF EXISTS "Students can delete own avatar" ON storage.objects;
CREATE POLICY "Students can delete own avatar"
    ON storage.objects FOR DELETE
    TO anon, authenticated
    USING (bucket_id = 'student-avatars');

-- =====================================================
-- 3. Create "batch-images" bucket (public)
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'batch-images',
    'batch-images',
    true,
    5242880, -- 5MB max
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for batch images
DROP POLICY IF EXISTS "Public can read batch images" ON storage.objects;
CREATE POLICY "Public can read batch images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'batch-images');

-- Admins can upload batch images
DROP POLICY IF EXISTS "Admins can upload batch images" ON storage.objects;
CREATE POLICY "Admins can upload batch images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'batch-images');

-- Admins can update batch images
DROP POLICY IF EXISTS "Admins can update batch images" ON storage.objects;
CREATE POLICY "Admins can update batch images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'batch-images');

-- Admins can delete batch images
DROP POLICY IF EXISTS "Admins can delete batch images" ON storage.objects;
CREATE POLICY "Admins can delete batch images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'batch-images');
