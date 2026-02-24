import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { supabase } from '@/config/supabase';

/**
 * Test interfaces matching database schema
 */
export type TestType = 'mock' | 'practice' | 'live';
export type TestStatus = 'draft' | 'published' | 'archived';
export type TestDifficulty = 'easy' | 'medium' | 'hard';

export interface Test {
    id: string;
    coaching_id: string;
    title: string;
    description?: string;
    type: TestType;
    exam_goal: string; // 'JEE', 'NEET', etc.
    subject: string;
    duration: number; // in minutes
    total_marks: number;
    passing_marks: number;
    total_questions: number;
    difficulty: TestDifficulty;
    status: TestStatus;
    scheduled_date?: string;
    attempts?: number;
    batch_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

/**
 * Query Keys for Tests
 */
export const testKeys = {
    all: (coachingId: string) => ['tests', coachingId] as const,
    filtered: (coachingId: string, filters: any) => ['tests', coachingId, filters] as const,
    detail: (testId: string) => ['tests', 'detail', testId] as const,
    byType: (coachingId: string, type: TestType) => ['tests', coachingId, 'type', type] as const,
    byExamGoal: (coachingId: string, examGoal: string) => ['tests', coachingId, 'examGoal', examGoal] as const,
};

/**
 * Get all tests for current coaching
 */
export function useTests(filters?: {
    type?: TestType;
    examGoal?: string;
    subject?: string;
    status?: TestStatus;
}) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: filters
            ? testKeys.filtered(coachingId!, filters)
            : testKeys.all(coachingId!),
        queryFn: async () => {
            let query = supabase
                .from('tests')
                .select('*')
                .eq('coaching_id', coachingId!);

            if (filters?.type) {
                query = query.eq('type', filters.type);
            }
            if (filters?.examGoal) {
                query = query.eq('exam_goal', filters.examGoal);
            }
            if (filters?.subject) {
                query = query.eq('subject', filters.subject);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data as Test[];
        },
        enabled: !!coachingId,
    });
}

/**
 * Get tests by type
 */
export function useTestsByType(type: TestType) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: testKeys.byType(coachingId!, type),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .eq('coaching_id', coachingId!)
                .eq('type', type)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Test[];
        },
        enabled: !!coachingId,
    });
}

/**
 * Get tests by exam goal
 */
export function useTestsByExamGoal(examGoal: string) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: testKeys.byExamGoal(coachingId!, examGoal),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .eq('coaching_id', coachingId!)
                .eq('exam_goal', examGoal)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Test[];
        },
        enabled: !!coachingId && !!examGoal,
    });
}

/**
 * Get a single test by ID
 */
export function useTest(testId: string | undefined) {
    return useQuery({
        queryKey: testKeys.detail(testId!),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .eq('id', testId!)
                .single();

            if (error) throw error;
            return data as Test;
        },
        enabled: !!testId,
    });
}

/**
 * Create a new test
 */
export function useCreateTest() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (testData: Partial<Test>) => {
            const { data, error } = await supabase
                .from('tests')
                .insert({ ...testData, coaching_id: coachingId! })
                .select()
                .single();

            if (error) throw error;
            return data as Test;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testKeys.all(coachingId!) });
        },
    });
}

/**
 * Update a test
 */
export function useUpdateTest() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async ({ testId, updates }: { testId: string; updates: Partial<Test> }) => {
            const { data, error } = await supabase
                .from('tests')
                .update(updates)
                .eq('id', testId)
                .select()
                .single();

            if (error) throw error;
            return data as Test;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: testKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: testKeys.all(coachingId!) });
        },
    });
}

/**
 * Delete a test (soft delete by setting status to archived)
 */
export function useDeleteTest() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (testId: string) => {
            const { data, error } = await supabase
                .from('tests')
                .update({ status: 'archived' })
                .eq('id', testId)
                .select()
                .single();

            if (error) throw error;
            return data as Test;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testKeys.all(coachingId!) });
        },
    });
}

/**
 * Publish a test (change status from draft to published)
 */
export function usePublishTest() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (testId: string) => {
            const { data, error } = await supabase
                .from('tests')
                .update({ status: 'published' })
                .eq('id', testId)
                .select()
                .single();

            if (error) throw error;
            return data as Test;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: testKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: testKeys.all(coachingId!) });
        },
    });
}
