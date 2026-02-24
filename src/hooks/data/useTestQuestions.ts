import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { useTenant } from '@/app/providers/TenantProvider';
import type { TestQuestion, CreateQuestionInput, StudentAttempt, CreateAttemptInput, UpdateAttemptInput } from '@/types/test';

// =====================================================
// QUESTION HOOKS
// =====================================================

// Get all questions for a test
export const useTestQuestions = (testId: string | undefined) => {
    return useQuery({
        queryKey: ['test-questions', testId],
        queryFn: async () => {
            if (!testId) return [];

            const { data, error } = await supabase
                .from('test_questions')
                .select('*')
                .eq('test_id', testId)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data as TestQuestion[];
        },
        enabled: !!testId
    });
};

// Create a question
export const useCreateQuestion = () => {
    const queryClient = useQueryClient();
    const { coaching } = useTenant();

    return useMutation({
        mutationFn: async (input: CreateQuestionInput) => {
            const { data, error } = await supabase
                .from('test_questions')
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data as TestQuestion;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['test-questions', variables.test_id] });
        }
    });
};

// Create multiple questions (bulk)
export const useCreateQuestions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (inputs: CreateQuestionInput[]) => {
            const { data, error } = await supabase
                .from('test_questions')
                .insert(inputs)
                .select();

            if (error) throw error;
            return data as TestQuestion[];
        },
        onSuccess: (data) => {
            if (data && data.length > 0) {
                queryClient.invalidateQueries({ queryKey: ['test-questions', data[0].test_id] });
            }
        }
    });
};

// Update a question
export const useUpdateQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ questionId, updates }: { questionId: string; updates: Partial<CreateQuestionInput> }) => {
            const { data, error } = await supabase
                .from('test_questions')
                .update(updates)
                .eq('id', questionId)
                .select()
                .single();

            if (error) throw error;
            return data as TestQuestion;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['test-questions', data.test_id] });
        }
    });
};

// Delete a question
export const useDeleteQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ questionId, testId }: { questionId: string; testId: string }) => {
            const { error } = await supabase
                .from('test_questions')
                .delete()
                .eq('id', questionId);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['test-questions', variables.testId] });
        }
    });
};

// =====================================================
// ATTEMPT HOOKS
// =====================================================

// Get student's attempts for a test
export const useStudentAttempts = (testId: string | undefined) => {
    return useQuery({
        queryKey: ['student-attempts', testId],
        queryFn: async () => {
            if (!testId) return [];

            const { data, error } = await supabase
                .from('student_attempts')
                .select('*')
                .eq('test_id', testId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as StudentAttempt[];
        },
        enabled: !!testId
    });
};

// Get all attempts for the current student (for dashboard/list view)
export const useAllStudentAttempts = () => {
    return useQuery({
        queryKey: ['student-all-attempts'],
        queryFn: async () => {
            // Custom bcrypt auth — read student ID from localStorage, not Supabase Auth
            const stored = localStorage.getItem('studentUser');
            if (!stored) return [];
            const user = JSON.parse(stored);
            if (!user?.id) return [];

            const { data, error } = await supabase
                .from('student_attempts')
                .select('*, tests(title, total_marks, total_questions, subject, passing_marks)')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as (StudentAttempt & { tests: { title: string, total_marks: number, total_questions: number, subject: string, passing_marks: number } })[];
        }
    });
};

// Get a single attempt
export const useAttempt = (attemptId: string | undefined) => {
    return useQuery({
        queryKey: ['attempt', attemptId],
        queryFn: async () => {
            if (!attemptId) return null;

            const { data, error } = await supabase
                .from('student_attempts')
                .select('*')
                .eq('id', attemptId)
                .maybeSingle();

            if (error) throw error;
            return data as StudentAttempt;
        },
        enabled: !!attemptId
    });
};

// Start a new attempt (or resume existing one)
export const useStartAttempt = () => {
    const queryClient = useQueryClient();
    const { coaching } = useTenant();

    return useMutation({
        mutationFn: async (input: CreateAttemptInput) => {
            // Custom bcrypt auth — read student ID from localStorage, not Supabase Auth
            const stored = localStorage.getItem('studentUser');
            if (!stored) throw new Error('Not authenticated');
            const studentUser = JSON.parse(stored);
            if (!studentUser?.id) throw new Error('Not authenticated');
            const userId = studentUser.id;

            // 1. Check for existing in-progress attempt to avoid 409 Conflict
            const { data: existingAttempt } = await supabase
                .from('student_attempts')
                .select('*')
                .eq('test_id', input.test_id)
                .eq('student_id', userId)
                .eq('status', 'in_progress')
                .maybeSingle();

            if (existingAttempt) {
                return existingAttempt as StudentAttempt;
            }

            // 2. Try to create new attempt
            try {
                const { data, error } = await supabase
                    .from('student_attempts')
                    .insert({
                        test_id: input.test_id,
                        student_id: userId,
                        coaching_id: coaching?.id,
                        total_marks: input.total_marks,
                        status: 'in_progress'
                    })
                    .select()
                    .single();

                if (error) {
                    if (error.code === '23505') {
                        const { data: existing, error: fetchError } = await supabase
                            .from('student_attempts')
                            .select('*')
                            .eq('test_id', input.test_id)
                            .eq('student_id', userId)
                            .eq('status', 'in_progress')
                            .single();

                        if (fetchError) throw fetchError;
                        return existing as StudentAttempt;
                    }
                    throw error;
                }
                return data as StudentAttempt;
            } catch (err: any) {
                if (err?.code === '23505') {
                    const { data: existing, error: fetchError } = await supabase
                        .from('student_attempts')
                        .select('*')
                        .eq('test_id', input.test_id)
                        .eq('student_id', userId)
                        .eq('status', 'in_progress')
                        .single();

                    if (fetchError) throw fetchError;
                    return existing as StudentAttempt;
                }
                throw err;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['student-attempts', data.test_id] });
        }
    });
};

// Update an attempt (save progress or submit)
export const useUpdateAttempt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ attemptId, updates }: { attemptId: string; updates: UpdateAttemptInput }) => {
            const { data, error } = await supabase
                .from('student_attempts')
                .update(updates)
                .eq('id', attemptId)
                .select()
                .single();

            if (error) throw error;
            return data as StudentAttempt;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['attempt', data.id] });
            queryClient.invalidateQueries({ queryKey: ['student-attempts', data.test_id] });
        }
    });
};

// Submit attempt (convenience wrapper)
export const useSubmitAttempt = () => {
    const updateAttempt = useUpdateAttempt();

    return useMutation({
        mutationFn: async ({ attemptId, answers, timeTaken }: { attemptId: string; answers: Record<string, string>; timeTaken: number }) => {
            return await updateAttempt.mutateAsync({
                attemptId,
                updates: {
                    answers,
                    status: 'submitted',
                    time_taken: timeTaken
                }
            });
        }
    });
};
