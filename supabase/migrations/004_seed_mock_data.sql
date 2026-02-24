-- Seed Mock Data for Batch-Centric Structure
-- This script dynamically finds an existing coaching_id and user_id to avoid foreign key errors.

DO $$
DECLARE
    v_coaching_id UUID;
    v_user_id UUID;
    v_batch_id UUID;
BEGIN
    -- 1. Get the first coaching ID
    SELECT id INTO v_coaching_id FROM coachings LIMIT 1;
    
    -- 2. Get the first user ID (admin or teacher)
    SELECT id INTO v_user_id FROM users LIMIT 1;

    -- If no coaching or user exists, exit
    IF v_coaching_id IS NULL OR v_user_id IS NULL THEN
        RAISE NOTICE 'No coaching or user found. Please create them first.';
        RETURN;
    END IF;

    -- 3. Create a Mock Batch
    INSERT INTO batches (
        coaching_id,
        name,
        description,
        exam_goal,
        start_date,
        end_date,
        fee_amount,
        status,
        created_by,
        max_students
    ) VALUES (
        v_coaching_id,
        'JEE Perfection Batch 2026',
        'Comprehensive physics and mathematics coverage for JEE Mains & Advanced. Includes daily live classes and recorded lectures.',
        'JEE Advanced',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 year',
        4999.00,
        'active',
        v_user_id,
        100
    ) RETURNING id INTO v_batch_id;

    RAISE NOTICE 'Created Batch: JEE Perfection Batch 2026';

    -- 4. Create Mock Courses (Videos) linked to this Batch
    INSERT INTO courses (
        coaching_id,
        batch_id,
        title,
        description,
        category,
        exam_goal,
        duration_hours,
        total_videos,
        is_free,
        status,
        created_by,
        thumbnail_url
    ) VALUES 
    (
        v_coaching_id,
        v_batch_id,
        'Rotational Dynamics (Full Series)',
        'Complete breakdown of torque, angular momentum, and rolling motion.',
        'Physics',
        'JEE Advanced',
        12.5,
        8,
        FALSE,
        'published',
        v_user_id,
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop'
    ),
    (
        v_coaching_id,
        v_batch_id,
        'Calculus: Limits & Continuity',
        'Master the fundamentals of calculus with problem-solving techniques.',
        'Mathematics',
        'JEE Mains',
        8.0,
        5,
        TRUE,
        'published',
        v_user_id,
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop'
    );

    RAISE NOTICE 'Created 2 Mock Courses linked to Batch.';

    -- 5. Create Mock Live Classes linked to this Batch
    INSERT INTO live_classes (
        coaching_id,
        batch_id,
        title,
        instructor_id,
        scheduled_at,
        duration_minutes,
        status,
        meeting_link
    ) VALUES 
    (
        v_coaching_id,
        v_batch_id,
        'Live: Doubt Clearing Session - Physics',
        v_user_id,
        NOW() + INTERVAL '1 day',
        60,
        'scheduled',
        'https://meet.google.com/abc-defg-hij'
    ),
    (
        v_coaching_id,
        v_batch_id,
        'Live: Electrostatics Discussion',
        v_user_id,
        NOW() + INTERVAL '3 days',
        90,
        'scheduled',
        'https://meet.google.com/xyz-uvwx-yz'
    ),
    (
        v_coaching_id,
        v_batch_id,
        'Past Class: Intro to Mechanics',
        v_user_id,
        NOW() - INTERVAL '2 days',
        60,
        'completed',
        'https://meet.google.com/previous-class'
    );

    RAISE NOTICE 'Created 3 Mock Live Classes linked to Batch.';

END $$;
