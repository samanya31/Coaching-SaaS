-- Migration: Create support_tickets table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS support_tickets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coaching_id  uuid NOT NULL REFERENCES coachings(id) ON DELETE CASCADE,
  student_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  student_name text,
  subject      text NOT NULL,
  description  text NOT NULL,
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at   timestamptz DEFAULT now()
);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS support_tickets_coaching_id_idx ON support_tickets(coaching_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);

-- RLS: allow students to insert their own tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can submit tickets" ON support_tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all tickets for their coaching" ON support_tickets
  FOR SELECT USING (true);

CREATE POLICY "Admins can update ticket status" ON support_tickets
  FOR UPDATE USING (true);
