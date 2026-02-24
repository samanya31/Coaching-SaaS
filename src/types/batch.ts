export interface Batch {
    id: string;
    coaching_id: string;

    // Core Info (database uses snake_case, mock uses camelCase)
    name: string;
    title?: string;  // Alias for name (backward compatibility with mock)
    description: string | null;
    exam_goal: string;
    examGoal?: string;  // Alias for exam_goal (backward compatibility with mock)

    // Schedule
    start_date: string;
    startDate?: Date | string;  // Alias for start_date (backward compatibility with mock)
    end_date: string | null;
    endDate?: Date | string | null;  // Alias for end_date
    schedule: Record<string, string[]> | null; // {"monday": ["09:00-11:00"], ...}
    duration?: string;  // Mock field for UI display (e.g., "6 months")

    // Limits & Enrollment
    max_students: number | null;
    current_students: number;
    students?: number;  // Alias for current_students (backward compatibility with mock)

    // Pricing
    fee_amount: number | null;
    fee_currency: string;
    price?: number;  // Alias for fee_amount (backward compatibility with mock)

    // Instructor (mock-specific fields for UI)
    instructor?: string;
    instructorAvatar?: string;

    // Stats & Ratings (mock-specific fields)
    rating?: number;
    totalClasses?: number;
    total_classes?: number;  // DB version

    // UI & Media (mock-specific)
    thumbnail?: string;
    thumbnail_url?: string;
    tags?: string[];

    // Metadata
    metadata?: any;
    isPurchased?: boolean; // Dynamically populated based on current user
    status: 'active' | 'completed' | 'archived';
    created_at: string;
    updated_at: string;
    created_by: string;
}

/**
 * Helper function to normalize batch data
 * Maps between database (snake_case) and mock (camelCase) formats
 */
export function normalizeBatch(batch: any): Batch {
    return {
        ...batch,
        // Map snake_case to camelCase for mock compatibility
        title: batch.title || batch.name,
        examGoal: batch.examGoal || batch.exam_goal,
        startDate: batch.startDate || batch.start_date,
        endDate: batch.endDate || batch.end_date,
        students: batch.students ?? batch.current_students,
        price: batch.price ?? batch.fee_amount,
        thumbnail: batch.thumbnail || batch.thumbnail_url,
        // Map camelCase to snake_case for database compatibility
        name: batch.name || batch.title,
        exam_goal: batch.exam_goal || batch.examGoal,
        start_date: batch.start_date || batch.startDate,
        end_date: batch.end_date || batch.endDate,
        current_students: batch.current_students ?? batch.students ?? 0,
        fee_amount: batch.fee_amount ?? batch.price,
        thumbnail_url: batch.thumbnail_url || batch.thumbnail,
    };
}

/**
 * Type guard to check if object is a valid Batch
 */
export function isBatch(obj: any): obj is Batch {
    return obj && typeof obj.id === 'string' && typeof obj.coaching_id === 'string';
}

