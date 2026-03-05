-- Add platform/zoom/youtube support to live_classes
ALTER TABLE live_classes
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'custom'
    CHECK (platform IN ('zoom', 'youtube', 'custom')),
  ADD COLUMN IF NOT EXISTS youtube_video_id TEXT,
  ADD COLUMN IF NOT EXISTS zoom_meeting_number TEXT,
  ADD COLUMN IF NOT EXISTS zoom_meeting_password TEXT;
