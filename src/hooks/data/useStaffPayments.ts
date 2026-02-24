import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { staffPaymentService, StaffPayment } from '@/services/api/staffPayment.service';

export const staffPaymentKeys = {
    all: (coachingId: string) => ['staff-payments', coachingId] as const,
    byStaff: (staffId: string) => ['staff-payments', 'staff', staffId] as const,
    byMonth: (coachingId: string, month: string) => ['staff-payments', coachingId, 'month', month] as const,
};

/**
 * Get all payments for current coaching
 */
export function useStaffPayments(month?: string) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: month
            ? staffPaymentKeys.byMonth(coachingId!, month)
            : staffPaymentKeys.all(coachingId!),
        queryFn: () => staffPaymentService.getPayments(coachingId!, month),
        enabled: !!coachingId,
    });
}

/**
 * Get payments for a specific staff member
 */
export function useStaffPaymentsByStaff(staffId: string) {
    return useQuery({
        queryKey: staffPaymentKeys.byStaff(staffId),
        queryFn: () => staffPaymentService.getPaymentsByStaff(staffId),
        enabled: !!staffId,
    });
}

/**
 * Create a payment
 */
export function useCreateStaffPayment() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (paymentData: Partial<StaffPayment>) =>
            staffPaymentService.createPayment({ ...paymentData, coaching_id: coachingId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffPaymentKeys.all(coachingId!) });
        },
    });
}

/**
 * Update a payment
 */
export function useUpdateStaffPayment() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<StaffPayment> }) =>
            staffPaymentService.updatePayment(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffPaymentKeys.all(coachingId!) });
        },
    });
}

/**
 * Delete a payment
 */
export function useDeleteStaffPayment() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (id: string) => staffPaymentService.deletePayment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffPaymentKeys.all(coachingId!) });
        },
    });
}
