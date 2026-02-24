export interface Course {
    id: string;
    coaching_id: string;

    title: string;
    description: string | null;
    thumbnail_url: string | null;
    category: string | null;
    exam_goal: string | null;

    // Content
    duration_hours: number | null;
    total_videos: number;
    total_tests: number;

    // Access
    is_free: boolean;
    price: number | null;

    // Metadata
    status: 'draft' | 'published' | 'archived';
    metadata?: any;
    created_at: string;
    updated_at: string;
    created_by: string;
}

export interface CourseContent {
    id: string;
    coaching_id: string;
    course_id: string;

    title: string;
    type: 'video' | 'pdf' | 'test' | 'live_class';

    // Media
    media_url: string | null;
    duration_seconds: number | null;
    file_size_mb: number | null;

    // Test data
    test_data: any | null;

    // Ordering
    section: string | null;
    order_index: number;

    // Access
    is_free: boolean;
    unlock_after_days: number;

    // Metadata
    status: 'published' | 'draft';
    created_at: string;
    updated_at: string;
}
