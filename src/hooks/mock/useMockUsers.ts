import { studentsData, type Student } from '@/data/studentsMockData';
import { User, normalizeUser } from '@/types/user';

/**
 * Mock hook wrapper for useUsers
 * Returns mock data in the same format as React Query hooks
 * Used when USE_DB=false for safe rollback
 */
export function useMockUsers(role?: string) {
    // Filter by role if provided
    const filteredData = role
        ? studentsData.filter(student => {
            if (role === 'student') return student;  // All mock data are students
            return false;
        })
        : studentsData;

    // Normalize data to match User interface
    const normalizedData = filteredData.map(student => normalizeUser(student as any));

    return {
        data: normalizedData as User[],
        isLoading: false,
        error: null,
        isError: false,
        isFetching: false,
        isSuccess: true,
    };
}

/**
 * Mock hook for single user by ID
 */
export function useMockUser(userId: string | undefined) {
    const student = userId
        ? studentsData.find(s => s.id === userId)
        : undefined;

    return {
        data: student ? normalizeUser(student as any) as User : undefined,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: !!student,
    };
}

/**
 * Mock hook for creating users
 */
export function useMockCreateUser() {
    return {
        mutate: (data: any) => {
            console.log('[MOCK] Creating user:', data);
            // In real app, this would add to local state
        },
        mutateAsync: async (data: any) => {
            console.log('[MOCK] Creating user:', data);
            return Promise.resolve(data);
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}

/**
 * Mock hook for updating users
 */
export function useMockUpdateUser() {
    return {
        mutate: (data: any) => {
            console.log('[MOCK] Updating user:', data);
        },
        mutateAsync: async (data: any) => {
            console.log('[MOCK] Updating user:', data);
            return Promise.resolve(data);
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}

/**
 * Mock hook for deleting users
 */
export function useMockDeleteUser() {
    return {
        mutate: (userId: string) => {
            console.log('[MOCK] Deleting user:', userId);
        },
        mutateAsync: async (userId: string) => {
            console.log('[MOCK] Deleting user:', userId);
            return Promise.resolve({ id: userId });
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}
