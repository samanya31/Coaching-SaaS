import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { batchService } from '@/services/api/batch.service';
import { Batch } from '@/types/batch';
import { supabase } from '@/config/supabase';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Query Keys for Batches
 */
export const batchKeys = {
    all: (coachingId: string) => ['batches', coachingId] as const,
    filtered: (coachingId: string, filters: any) => ['batches', coachingId, filters] as const,
    detail: (batchId: string) => ['batches', 'detail', batchId] as const,
    students: (batchId: string) => ['batches', 'students', batchId] as const,
    stats: (batchId: string) => ['batches', 'stats', batchId] as const,
};

/**
 * Get all batches for current coaching
 */
export function useBatches(filters?: { examGoal?: string; status?: string }) {
    const { coachingId } = useTenant();
    const { user } = useAuth();

    return useQuery({
        queryKey: filters
            ? batchKeys.filtered(coachingId!, filters)
            : batchKeys.all(coachingId!),
        queryFn: async () => {
            return batchService.getBatches(coachingId!, filters, user?.id);
        },
        enabled: !!coachingId,
    });
}

/**
 * Get a single batch by ID
 */
export function useBatch(batchId: string | undefined) {
    const { user } = useAuth();

    return useQuery({
        queryKey: batchKeys.detail(batchId!),
        queryFn: async () => {
            return batchService.getBatchById(batchId!, user?.id);
        },
        enabled: !!batchId,
    });
}

/**
 * Get batches by exam goal
 */
export function useBatchesByExamGoal(examGoal: string | undefined) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: batchKeys.filtered(coachingId!, { examGoal }),
        queryFn: () => batchService.getBatchesByExamGoal(coachingId!, examGoal!),
        enabled: !!coachingId && !!examGoal,
    });
}

/**
 * Get students enrolled in a batch
 */
export function useBatchStudents(batchId: string | undefined) {
    return useQuery({
        queryKey: batchKeys.students(batchId!),
        queryFn: () => batchService.getBatchStudents(batchId!),
        enabled: !!batchId,
    });
}

/**
 * Get batch statistics
 */
export function useBatchStats(batchId: string | undefined) {
    return useQuery({
        queryKey: batchKeys.stats(batchId!),
        queryFn: () => batchService.getBatchStats(batchId!),
        enabled: !!batchId,
    });
}

/**
 * Create a new batch
 */
export function useCreateBatch() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (batchData: Partial<Batch>) =>
            batchService.createBatch({ ...batchData, coaching_id: coachingId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: batchKeys.all(coachingId!) });
        },
    });
}

/**
 * Update a batch
 * If status changes to 'completed' or 'cancelled', also deletes the batch image from storage.
 */
export function useUpdateBatch() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async ({ batchId, updates }: { batchId: string; updates: Partial<Batch> }) => {
            // If batch is being marked as completed or cancelled, clean up its image
            const endingStatuses = ['completed', 'cancelled', 'ended'];
            if (updates.status && endingStatuses.includes(updates.status)) {
                try {
                    const { data: batch } = await supabase
                        .from('batches')
                        .select('thumbnail_url')
                        .eq('id', batchId)
                        .single();

                    if (batch?.thumbnail_url?.includes('batch-images')) {
                        // Extract storage path from public URL
                        const url = new URL(batch.thumbnail_url);
                        const storagePath = url.pathname.split('/batch-images/')[1]?.split('?')[0];
                        if (storagePath) {
                            await supabase.storage.from('batch-images').remove([storagePath]);
                            console.log('🗑️ Batch image deleted for ended batch:', batchId);
                        }
                    }
                } catch (err) {
                    console.warn('Could not clean up batch image:', err);
                }
            }
            return batchService.updateBatch(batchId, updates);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: batchKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: batchKeys.all(coachingId!) });
        },
    });
}

/**
 * Delete a batch (soft delete) + clean up its image from storage
 */
export function useDeleteBatch() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (batchId: string) => {
            // Fetch batch first to get thumbnail_url for storage cleanup
            try {
                const { data: batch } = await supabase
                    .from('batches')
                    .select('thumbnail_url')
                    .eq('id', batchId)
                    .single();

                if (batch?.thumbnail_url?.includes('batch-images')) {
                    const url = new URL(batch.thumbnail_url);
                    const storagePath = url.pathname.split('/batch-images/')[1]?.split('?')[0];
                    if (storagePath) {
                        await supabase.storage.from('batch-images').remove([storagePath]);
                        console.log('🗑️ Batch image deleted alongside batch:', batchId);
                    }
                }
            } catch (err) {
                console.warn('Could not clean up batch image before delete:', err);
            }

            return batchService.deleteBatch(batchId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: batchKeys.all(coachingId!) });
        },
    });
}

/**
 * Enroll a student in a batch
 */
export function useEnrollStudent() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ batchId, userId }: { batchId: string; userId: string }) =>
            batchService.enrollStudent(batchId, userId, coachingId!),
        onSuccess: (_, { batchId }) => {
            queryClient.invalidateQueries({ queryKey: batchKeys.students(batchId) });
            queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
            queryClient.invalidateQueries({ queryKey: batchKeys.stats(batchId) });
        },
    });
}

/**
 * Unenroll a student from a batch
 */
export function useUnenrollStudent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ enrollmentId, batchId }: { enrollmentId: string; batchId: string }) =>
            batchService.unenrollStudent(enrollmentId),
        onSuccess: (_, { batchId }) => {
            queryClient.invalidateQueries({ queryKey: batchKeys.students(batchId) });
            queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
            queryClient.invalidateQueries({ queryKey: batchKeys.stats(batchId) });
        },
    });
}
