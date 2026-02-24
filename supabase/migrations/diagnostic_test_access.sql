-- =====================================================
-- DIAGNOSTIC: CHECK TEST ACCESS & QUESTIONS
-- =====================================================
-- Run this in Supabase SQL Editor to see what the database returns for your user.
-- This helps verify if RLS or missing data is the issue.
-- =====================================================

-- 1. Check if ANY tests are visible to you (as the logged-in user)
-- Note: In SQL Editor, you are usually 'postgres' or 'anon'.
-- To simulate a student, we can't easily switch roles here, 
-- but we can check if the data exists generally first.

SELECT 'Checking Total Tests' as check_name, count(*) as count FROM tests;
SELECT 'Checking Total Questions' as check_name, count(*) as count FROM test_questions;

-- 2. Inspect a specific test (Replace TEST_ID_HERE with the ID from your URL)
-- If you don't know the ID, just run the query below to see the first 5 tests.
SELECT 
    t.id as test_id, 
    t.title, 
    t.total_questions as declared_questions,
    (SELECT count(*) FROM test_questions q WHERE q.test_id = t.id) as actual_questions_count
FROM tests t
LIMIT 5;

-- 3. Check RLS Policies (Metadata)
SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('tests', 'test_questions', 'student_attempts');

-- 4. Check if you can see questions for a random test
-- This query mimics the client-side attempt to fetch questions
WITH sample_test AS (SELECT id FROM tests LIMIT 1)
SELECT 
    t.id as test_id,
    q.id as question_id,
    q.question_text
FROM tests t
JOIN test_questions q ON q.test_id = t.id
WHERE t.id = (SELECT id FROM sample_test);
