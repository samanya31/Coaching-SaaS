-- Add batch_id to courses table to link Recorded Content to Batches
ALTER TABLE courses ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES batches(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_courses_batch_id ON courses(batch_id);
