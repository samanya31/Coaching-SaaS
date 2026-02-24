import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { userService } from '@/services/api/user.service';
import { User } from '@/types/user';

/**
 * Query Keys for Users
 */
export const userKeys = {
    all: (coachingId: string) => ['users', coachingId] as const,
    byRole: (coachingId: string, role: string) => ['users', coachingId, role] as const,
    detail: (userId: string) => ['users', 'detail', userId] as const,
    students: (coachingId: string, filters?: any) => ['users', coachingId, 'students', filters] as const,
    teachers: (coachingId: string) => ['users', coachingId, 'teachers'] as const,
    admins: (coachingId: string) => ['users', coachingId, 'admins'] as const,
    counts: (coachingId: string) => ['users', coachingId, 'counts'] as const,
};

/**
 * Get all users for current coaching
 */
export function useUsers(role?: string) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: role ? userKeys.byRole(coachingId!, role) : userKeys.all(coachingId!),
        queryFn: () => userService.getUsers(coachingId!, role),
        enabled: !!coachingId,
    });
}

/**
 * Get a single user by ID
 */
export function useUser(userId: string | undefined) {
    return useQuery({
        queryKey: userKeys.detail(userId!),
        queryFn: () => userService.getUserById(userId!),
        enabled: !!userId,
    });
}

/**
 * Get students for current coaching
 */
export function useStudents(filters?: { examGoal?: string; batchId?: string }) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: userKeys.students(coachingId!, filters),
        queryFn: () => userService.getStudents(coachingId!, filters),
        enabled: !!coachingId,
    });
}

/**
 * Get teachers for current coaching
 */
export function useTeachers() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: userKeys.teachers(coachingId!),
        queryFn: () => userService.getTeachers(coachingId!),
        enabled: !!coachingId,
    });
}

/**
 * Get admins for current coaching
 */
export function useAdmins() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: userKeys.admins(coachingId!),
        queryFn: () => userService.getAdmins(coachingId!),
        enabled: !!coachingId,
    });
}

/**
 * Get user counts by role
 */
export function useUserCounts() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: userKeys.counts(coachingId!),
        queryFn: () => userService.getUserCounts(coachingId!),
        enabled: !!coachingId,
    });
}

/**
 * Create a new user
 */
export function useCreateUser() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (userData: Partial<User>) =>
            userService.createUser({ ...userData, coaching_id: coachingId! }),
        onSuccess: () => {
            // Invalidate all user queries for this coaching
            queryClient.invalidateQueries({ queryKey: userKeys.all(coachingId!) });
        },
    });
}

/**
 * Update a user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ userId, updates }: { userId: string; updates: Partial<User> }) =>
            userService.updateUser(userId, updates),
        onSuccess: (data) => {
            // Invalidate user detail and list queries
            queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: userKeys.all(coachingId!) });
        },
    });
}

/**
 * Delete a user (soft delete)
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (userId: string) => userService.deleteUser(userId),
        onSuccess: () => {
            // Invalidate all user queries
            queryClient.invalidateQueries({ queryKey: userKeys.all(coachingId!) });
        },
    });
}

/**
 * Search users
 */
export function useSearchUsers(searchTerm: string, role?: string) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: ['users', coachingId, 'search', searchTerm, role],
        queryFn: () => userService.searchUsers(coachingId!, searchTerm, role),
        enabled: !!coachingId && searchTerm.length > 0,
    });
}
