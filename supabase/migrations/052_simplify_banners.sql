-- Migration: Simplify Banners
-- Purpose: Remove text-overlay fields (title, description, cta_text, cta_link)
-- leaving banners as pure image assets.

ALTER TABLE public.banners
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS cta_text,
DROP COLUMN IF EXISTS cta_link;
