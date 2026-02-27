import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { supabase } from '@/config/supabase';

/**
 * LiveClass interface matching database schema
 */
export interface LiveClass {
    id: string;
    coaching_id: string;
    title: string;
    description?: string;
    instructor: string;
    batch_id?: string;
    scheduled_at: string;
    duration_minutes: number;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    platform?: string;
    meeting_link?: string;
    recording_url?: string;
    max_participants?: number;
    created_at?: string;
    updated_at?: string;
}

/**
 * Query Keys for Live Classes
 */
export const liveClassKeys = {
    all: (coachingId: string) => ['live-classes', coachingId] as const,
    filtered: (coachingId: string, filters: any) => ['live-classes', coachingId, filters] as const,
    detail: (classId: string) => ['live-classes', 'detail', classId] as const,
    upcoming: (coachingId: string) => ['live-classes', coachingId, 'upcoming'] as const,
    past: (coachingId: string) => ['live-classes', coachingId, 'past'] as const,
};

/**
 * Get all live classes for current coaching
 */
export function useLiveClasses(filters?: {
    status?: string;
    batchId?: string;
}) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: filters
            ? liveClassKeys.filtered(coachingId!, filters)
            : liveClassKeys.all(coachingId!),
        queryFn: async () => {
            let query = supabase
                .from('live_classes')
                .select('*')
                .eq('coaching_id', coachingId!);

            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.batchId) {
                query = query.eq('batch_id', filters.batchId);
            }

            const { data, error } = await query.order('scheduled_at', { ascending: true });

            if (error) throw error;
            return data as LiveClass[];
        },
        enabled: !!coachingId,
    });
}

/**
 * Get upcoming live classes
 */
export function useUpcomingLiveClasses() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: liveClassKeys.upcoming(coachingId!),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('live_classes')
                .select('*')
                .eq('coaching_id', coachingId!)
                .gte('scheduled_at', new Date().toISOString())
                .order('scheduled_at', { ascending: true });

            if (error) throw error;
            return data as LiveClass[];
        },
        enabled: !!coachingId,
    });
}

/**
 * Get past live classes
 */
export function usePastLiveClasses() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: liveClassKeys.past(coachingId!),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('live_classes')
                .select('*')
                .eq('coaching_id', coachingId!)
                .lt('scheduled_at', new Date().toISOString())
                .order('scheduled_at', { ascending: false });

            if (error) throw error;
            return data as LiveClass[];
        },
        enabled: !!coachingId,
    });
}

/**
 * Get a single live class by ID
 */
export function useLiveClass(classId: string | undefined) {
    return useQuery({
        queryKey: liveClassKeys.detail(classId!),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('live_classes')
                .select('*')
                .eq('id', classId!)
                .single();

            if (error) throw error;
            return data as LiveClass;
        },
        enabled: !!classId,
    });
}

/**
 * Create a new live class
 */
export function useCreateLiveClass() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (classData: Partial<LiveClass>) => {
            const { data, error } = await supabase
                .from('live_classes')
                .insert({ ...classData, coaching_id: coachingId! })
                .select()
                .single();

            if (error) throw error;
            return data as LiveClass;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: liveClassKeys.all(coachingId!) });
        },
    });
}

/**
 * Update a live class
 */
export function useUpdateLiveClass() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async ({ classId, updates }: { classId: string; updates: Partial<LiveClass> }) => {
            const { data, error } = await supabase
                .from('live_classes')
                .update(updates)
                .eq('id', classId)
                .select()
                .single();

            if (error) throw error;
            return data as LiveClass;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: liveClassKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: liveClassKeys.all(coachingId!) });
        },
    });
}

/**
 * Delete a live class (hard delete)
 */
export function useDeleteLiveClass() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (classId: string) => {
            const { error } = await supabase
                .from('live_classes')
                .delete()
                .eq('id', classId);

            if (error) throw error;
            return classId; // Return ID so onSuccess knows what was deleted if needed
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: liveClassKeys.all(coachingId!) });
        },
    });
}

/**
 * Start a live class (update status to 'live')
 */
export function useStartLiveClass() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (classId: string) => {
            const { data, error } = await supabase
                .from('live_classes')
                .update({ status: 'live' })
                .eq('id', classId)
                .select()
                .single();

            if (error) throw error;
            return data as LiveClass;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: liveClassKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: liveClassKeys.all(coachingId!) });
        },
    });
}

/**
 * Complete a live class (update status to 'completed')
 */
export function useCompleteLiveClass() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (classId: string) => {
            const { data, error } = await supabase
                .from('live_classes')
                .update({ status: 'completed' })
                .eq('id', classId)
                .select()
                .single();

            if (error) throw error;
            return data as LiveClass;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: liveClassKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: liveClassKeys.all(coachingId!) });
        },
    });
}
