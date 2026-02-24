-- Migration: Add targeting columns to announcements table
-- Run this in your Supabase SQL Editor

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS target_roles    text[]    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_batches  text[]    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS target_exam_goals text[]  DEFAULT '{}';
