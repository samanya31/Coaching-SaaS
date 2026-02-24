import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { enrollmentService } from '@/services/api/enrollment.service';
import { paymentKeys } from './usePayments';
import { batchKeys } from './useBatches';
import { userKeys } from './useUsers';

/**
 * Hook to enroll a student in a batch with a recorded payment
 */
export function useEnrollWithPayment() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({
            userId,
            batchId,
            amount,
            method,
            transactionId
        }: {
            userId: string;
            batchId: string;
            amount: number;
            method: string;
            transactionId?: string;
        }) => enrollmentService.enrollStudent(coachingId!, userId, batchId, amount, { method, transactionId }),
        onSuccess: (_, { batchId, userId }) => {
            // Invalidate relevant queries to update UI
            queryClient.invalidateQueries({ queryKey: paymentKeys.all(coachingId!) });
            queryClient.invalidateQueries({ queryKey: batchKeys.students(batchId) });
            queryClient.invalidateQueries({ queryKey: batchKeys.stats(batchId) });
            queryClient.invalidateQueries({ queryKey: userKeys.all(coachingId!) });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
            queryClient.invalidateQueries({ queryKey: userKeys.counts(coachingId!) });
        },
    });
}
