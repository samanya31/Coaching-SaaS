import { supabase } from '@/config/supabase';
import { Batch } from '@/types/batch';

/**
 * Batch Service - Tenant-Aware
 * 
 * All functions automatically filter by coaching_id
 */

export const batchService = {
    /**
     * Get all batches for a coaching
     */
    async getBatches(coachingId: string, filters?: {
        examGoal?: string;
        status?: string;
    }, userId?: string) {
        let query = supabase
            .from('batches')
            .select(`
        *,
        batch_enrollments(count)
      `)
            .eq('coaching_id', coachingId)
            .order('created_at', { ascending: false });

        if (filters?.examGoal) {
            query = query.eq('exam_goal', filters.examGoal);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        } else {
            query = query.eq('status', 'active');
        }

        const { data, error } = await query;

        if (error) {
            console.error('[batchService] Error fetching batches:', error);
            throw error;
        }

        let batches = data as Batch[];

        // Check enrollment status if userId is provided and is a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (userId && uuidRegex.test(userId) && batches.length > 0) {
            const batchIds = batches.map(b => b.id);
            const { data: enrollments } = await supabase
                .from('batch_enrollments')
                .select('batch_id')
                .eq('user_id', userId)
                .in('batch_id', batchIds)
                .eq('status', 'active');

            const enrolledBatchIds = new Set(enrollments?.map(e => e.batch_id));

            batches = batches.map(b => ({
                ...b,
                isPurchased: enrolledBatchIds.has(b.id)
            }));
        }

        return batches;
    },

    /**
     * Get a single batch by ID
     */
    async getBatchById(batchId: string, userId?: string) {
        const { data, error } = await supabase
            .from('batches')
            .select(`
        *,
        batch_enrollments(
          id,
          user:users(id, full_name, email, student_id)
        )
      `)
            .eq('id', batchId)
            .single();

        if (error) {
            console.error('[batchService] Error fetching batch:', error);
            throw error;
        }

        let batch = data as Batch;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (userId && uuidRegex.test(userId)) {
            const { data: enrollment } = await supabase
                .from('batch_enrollments')
                .select('id')
                .eq('batch_id', batchId)
                .eq('user_id', userId)
                .eq('status', 'active')
                .maybeSingle();

            batch.isPurchased = !!enrollment;
        }

        return batch;
    },

    /**
     * Create a new batch
     */
    async createBatch(batchData: Partial<Batch> & { coaching_id: string }) {
        const { data, error } = await supabase
            .from('batches')
            .insert([batchData])
            .select()
            .single();

        if (error) {
            console.error('[batchService] Error creating batch:', error);
            throw error;
        }

        return data as Batch;
    },

    /**
     * Update a batch
     */
    async updateBatch(batchId: string, updates: Partial<Batch>) {
        const { data, error } = await supabase
            .from('batches')
            .update(updates)
            .eq('id', batchId)
            .select()
            .single();

        if (error) {
            console.error('[batchService] Error updating batch:', error);
            throw error;
        }

        return data as Batch;
    },

    /**
     * Delete a batch (soft delete by setting status to archived)
     */
    async deleteBatch(batchId: string) {
        const { data, error } = await supabase
            .from('batches')
            .update({ status: 'archived' })
            .eq('id', batchId)
            .select()
            .single();

        if (error) {
            console.error('[batchService] Error deleting batch:', error);
            throw error;
        }

        return data as Batch;
    },

    /**
     * Enroll a student in a batch
     */
    async enrollStudent(batchId: string, userId: string, coachingId: string) {
        const { data, error } = await supabase
            .from('batch_enrollments')
            .upsert([{
                batch_id: batchId,
                user_id: userId,
                coaching_id: coachingId,
                status: 'active'
            }], {
                onConflict: 'batch_id,user_id'
            })
            .select()
            .single();

        if (error) {
            console.error('[batchService] Error enrolling student:', error);
            throw error;
        }

        return data;
    },

    /**
     * Unenroll a student from a batch
     */
    async unenrollStudent(enrollmentId: string) {
        const { error } = await supabase
            .from('batch_enrollments')
            .delete()
            .eq('id', enrollmentId);

        if (error) {
            console.error('[batchService] Error unenrolling student:', error);
            throw error;
        }

        return { success: true };
    },

    /**
     * Get students enrolled in a batch
     */
    async getBatchStudents(batchId: string) {
        const { data, error } = await supabase
            .from('batch_enrollments')
            .select(`
        id,
        enrolled_at,
        status,
        user:users(
          id,
          full_name,
          email,
          student_id,
          exam_goal,
          avatar_url
        )
      `)
            .eq('batch_id', batchId)
            .eq('status', 'active');

        if (error) {
            console.error('[batchService] Error fetching batch students:', error);
            throw error;
        }

        return data;
    },

    /** 
     * Get batches by exam goal
     */
    async getBatchesByExamGoal(coachingId: string, examGoal: string) {
        return this.getBatches(coachingId, { examGoal, status: 'active' });
    },

    /**
     * Get batch statistics
     */
    async getBatchStats(batchId: string) {
        const batch = await this.getBatchById(batchId);

        const enrollments = batch.batch_enrollments || [];
        const currentStudents = enrollments.length;
        const maxStudents = batch.max_students || Infinity;
        const availableSeats = maxStudents - currentStudents;
        const isFull = currentStudents >= maxStudents;

        return {
            currentStudents,
            maxStudents,
            availableSeats,
            isFull,
            fillPercentage: maxStudents > 0 ? (currentStudents / maxStudents) * 100 : 0
        };
    }
};
