-- Migration 010: Add Metadata to Courses and Content
-- Purpose: Allow storing flexible data (like custom dates, extra info) without schema changes.

BEGIN;

-- Add metadata to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add metadata to course_content
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMIT;
