import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { paymentService } from '@/services/api/payment.service';
import { Payment, PaymentInsert } from '@/types/payment';

export const paymentKeys = {
    all: (coachingId: string) => ['payments', coachingId] as const,
    student: (studentId: string) => ['payments', 'student', studentId] as const,
};

/**
 * Hook for Admin to get all payments
 */
export function usePayments() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: paymentKeys.all(coachingId || 'default'),
        queryFn: () => paymentService.getPayments(coachingId || ''),
        enabled: !!coachingId,
    });
}

/**
 * Hook for Student to get their own payments
 */
export function useStudentPayments(studentId?: string) {
    return useQuery({
        queryKey: paymentKeys.student(studentId || ''),
        queryFn: () => paymentService.getStudentPayments(studentId || ''),
        enabled: !!studentId,
    });
}

/**
 * Hook to create a payment
 */
export function useCreatePayment() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (payment: PaymentInsert) => paymentService.createPayment(payment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all(coachingId || 'default') });
        },
    });
}

/**
 * Hook to update payment status
 */
export function useUpdatePaymentStatus() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: Payment['status'] }) =>
            paymentService.updatePaymentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all(coachingId || 'default') });
        },
    });
}
