import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { roleService, Role } from '@/services/api/role.service';

export const roleKeys = {
    all: (coachingId: string) => ['roles', coachingId] as const,
    detail: (roleId: string) => ['roles', 'detail', roleId] as const,
};

/**
 * Get all roles for current coaching
 */
export function useRoles() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: roleKeys.all(coachingId!),
        queryFn: () => roleService.getRoles(coachingId!),
        enabled: !!coachingId,
    });
}

/**
 * Create a new role
 */
export function useCreateRole() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (roleData: Partial<Role>) =>
            roleService.createRole({ ...roleData, coaching_id: coachingId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all(coachingId!) });
        },
    });
}

/**
 * Update a role
 */
export function useUpdateRole() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Role> }) =>
            roleService.updateRole(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all(coachingId!) });
        },
    });
}

/**
 * Delete a role
 */
export function useDeleteRole() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (id: string) => roleService.deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all(coachingId!) });
        },
    });
}
