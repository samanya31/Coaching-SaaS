-- DIAGNOSTIC: Check Table Schema
-- Run this to see if 'is_public' exists and what columns are there.
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns 
WHERE 
    table_name = 'study_materials';
