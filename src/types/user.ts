export type UserRole = 'super_admin' | 'coaching_admin' | 'teacher' | 'student';

export interface User {
    id: string;
    coaching_id: string;

    // Profile (database uses snake_case, mock uses camelCase)
    full_name: string;
    name?: string;  // Alias for full_name (backward compatibility with mock)
    email: string;
    phone: string | null;
    avatar_url: string | null;
    avatar?: string;  // Alias for avatar_url (backward compatibility with mock)
    password_hash?: string;

    // New fields
    address?: string | null;
    personal_email?: string | null;

    // Role & Permissions
    role: UserRole;
    permissions?: string[];

    // Student-specific fields (database)
    student_id?: string;
    exam_goal?: string;
    examGoal?: string;  // Alias for exam_goal (backward compatibility with mock)
    registration_date?: string;
    registrationDate?: string;  // Alias for registration_date (backward compatibility with mock)
    language?: 'Hinglish' | 'English' | 'Hindi';

    // Student engagement metrics
    enrolledBatches?: string[];  // batch IDs
    enrolled_batches?: string[];  // DB version
    totalWatchTime?: number;  // in minutes
    total_watch_time?: number;  // DB version
    lastActive?: string;
    last_active?: string;  // DB version
    classesCompleted?: number;
    classes_completed?: number;  // DB version
    testsTaken?: number;
    tests_taken?: number;  // DB version
    averageScore?: number;
    average_score?: number;  // DB version

    // Teacher-specific fields
    specialization?: string[];
    bio?: string;

    // Metadata
    metadata?: any;
    status: 'active' | 'inactive' | 'suspended' | 'blocked';
    last_login_at?: string | null;
    created_at?: string;
    // Relationship
    batch_enrollments?: Array<{
        batch_id: string;
        status: string;
        batches?: {
            id: string;
            name: string;
            thumbnail_url: string | null;
            exam_goal: string;
        };
    }>;

    updated_at?: string;
}

/**
 * Type guard to check if user is a student
 */
export function isStudent(user: User): boolean {
    return user.role === 'student';
}

/**
 * Type guard to check if user is a teacher
 */
export function isTeacher(user: User): boolean {
    return user.role === 'teacher';
}

/**
 * Type guard to check if user is an admin
 */
export function isAdmin(user: User): boolean {
    return user.role === 'coaching_admin' || user.role === 'super_admin';
}

/**
 * Normalize user data from database or mock to have consistent property names
 * This ensures backward compatibility during migration
 */
export function normalizeUser(user: any): User {
    return {
        ...user,
        // Normalize name
        name: user.name || user.full_name,
        full_name: user.full_name || user.name,
        // Normalize avatar
        avatar: user.avatar || user.avatar_url,
        avatar_url: user.avatar_url || user.avatar,
        // Normalize exam goal
        examGoal: user.examGoal || user.exam_goal,
        exam_goal: user.exam_goal || user.examGoal,
        // Normalize registration date
        registrationDate: user.registrationDate || user.registration_date,
        registration_date: user.registration_date || user.registrationDate,
        // Normalize engagement metrics
        enrolledBatches: user.enrolledBatches || user.enrolled_batches || [],
        totalWatchTime: user.totalWatchTime || user.total_watch_time || 0,
        lastActive: user.lastActive || user.last_active,
        classesCompleted: user.classesCompleted || user.classes_completed || 0,
        testsTaken: user.testsTaken || user.tests_taken || 0,
        averageScore: user.averageScore || user.average_score || 0,
    };
}

