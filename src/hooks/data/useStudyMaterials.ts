import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export interface StudyMaterial {
    id: string;
    batch_id?: string; // Nullable for global materials
    coaching_id: string;
    title: string;
    description?: string;
    file_url: string;
    file_type: string;
    is_public: boolean;
    uploaded_by: string;
    created_at: string;
    updated_at: string;
    uploader?: {
        full_name: string;
    };
    batch?: {
        title: string;
    };
}

/**
 * Hook to fetch study materials for a batch
 */
export const useStudyMaterials = (batchId?: string) => {
    return useQuery({
        queryKey: ['study-materials', batchId],
        queryFn: async () => {
            if (!batchId) return [];

            const { data, error } = await supabase
                .from('study_materials')
                .select('*, uploader:users(full_name), batch:batches!fk_study_materials_batches(title:name)')
                .eq('batch_id', batchId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching study materials:', error);
                throw error;
            }

            return data as StudyMaterial[];
        },
        enabled: !!batchId
    });
};

/**
 * Hook to create a new study material (URL-based, no file upload)
 */
export const useCreateStudyMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vars: {
            batch_id?: string;
            coaching_id: string;
            title: string;
            description: string;
            file_url: string;
            is_public?: boolean;
        }) => {
            // Determine file type from URL
            const fileType = vars.file_url.split('.').pop()?.toLowerCase() || 'file';

            const { error } = await supabase
                .from('study_materials')
                .insert({
                    batch_id: vars.is_public ? null : vars.batch_id, // If public, batch_id can be null or we can keep it for reference. Let's make it null for true global.
                    coaching_id: vars.coaching_id,
                    title: vars.title,
                    description: vars.description,
                    file_url: vars.file_url,
                    file_type: fileType,
                    is_public: vars.is_public || false
                });

            if (error) {
                console.error('Error creating study material:', error);
                throw error;
            }
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['study-materials'] });
            if (vars.batch_id) {
                queryClient.invalidateQueries({ queryKey: ['study-materials', vars.batch_id] });
            }
        }
    });
};

/**
 * Hook to delete a study material
 */
export const useDeleteStudyMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('study_materials')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting study material:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-materials'] });
        }
    });
};

/**
 * Hook to fetch ALL study materials for the current logged-in student.
 * This includes:
 * 1. Materials from enrolled batches
 * 2. Public materials (Current Affairs)
 */
export const useAllStudentStudyMaterials = () => {
    return useQuery({
        queryKey: ['study-materials', 'student-all'],
        queryFn: async () => {
            // Custom bcrypt auth — read student ID from localStorage, not Supabase Auth
            const stored = localStorage.getItem('studentUser');
            if (!stored) return [];
            const user = JSON.parse(stored);
            if (!user?.id) return [];

            // 1. Get enrolled batch IDs
            const { data: enrollments, error: enrollmentError } = await supabase
                .from('batch_enrollments')
                .select('batch_id')
                .eq('user_id', user.id)
                .eq('status', 'active');

            if (enrollmentError) throw enrollmentError;

            const batchIds = enrollments.map(e => e.batch_id);

            // 2. Fetch Materials using Parallel Queries (More robust than complex OR syntax)

            // Query A: Public Materials
            // We use explicit FK reference !fk_study_materials_batches to match the new migration
            // We select 'title:name' because the DB column is 'name' but frontend expects 'title'
            const publicQuery = supabase
                .from('study_materials')
                .select('*, batch:batches!fk_study_materials_batches(title:name)')
                .eq('is_public', true)
                .order('created_at', { ascending: false });

            // Query B: Enrolled Batch Materials
            let enrolledQuery: Promise<any> = Promise.resolve({ data: [] });
            if (batchIds.length > 0) {
                enrolledQuery = supabase
                    .from('study_materials')
                    .select('*, batch:batches!fk_study_materials_batches(title:name)')
                    .in('batch_id', batchIds)
                    .order('created_at', { ascending: false });
            }

            const [publicRes, enrolledRes] = await Promise.all([publicQuery, enrolledQuery]);

            // Handle errors gracefully
            if (publicRes.error) {
                console.warn('Error fetching public materials:', publicRes.error);
            }
            if (enrolledRes.error) {
                console.error('Error fetching enrolled materials:', enrolledRes.error);
                throw enrolledRes.error;
            }

            const publicMaterials = publicRes.data || [];
            const enrolledMaterials = enrolledRes.data || [];

            // 3. Merge and Deduplicate
            const allMaterials = [...publicMaterials, ...enrolledMaterials];
            const uniqueMaterials = Array.from(new Map(allMaterials.map(item => [item.id, item])).values());

            // 4. Sort by date desc
            return uniqueMaterials.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            ) as (StudyMaterial & { batch: { title: string } })[];
        }
    });
};
