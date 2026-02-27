import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { courseService } from '@/services/api/course.service';
import { Course } from '@/types/course';

/**
 * Query Keys for Courses
 */
export const courseKeys = {
    all: (coachingId: string) => ['courses', coachingId] as const,
    filtered: (coachingId: string, filters: any) => ['courses', coachingId, filters] as const,
    detail: (courseId: string) => ['courses', 'detail', courseId] as const,
    withContent: (courseId: string) => ['courses', 'withContent', courseId] as const,
    free: (coachingId: string) => ['courses', coachingId, 'free'] as const,
};

/**
 * Get all courses for current coaching
 */
export function useCourses(filters?: {
    category?: string;
    examGoal?: string;
    status?: string;
    batchId?: string;
}) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: filters
            ? courseKeys.filtered(coachingId!, filters)
            : courseKeys.all(coachingId!),
        queryFn: () => courseService.getCourses(coachingId!, filters),
        enabled: !!coachingId,
    });
}

/**
 * Get a single course by ID
 */
export function useCourse(courseId: string | undefined) {
    return useQuery({
        queryKey: courseKeys.detail(courseId!),
        queryFn: () => courseService.getCourseById(courseId!),
        enabled: !!courseId,
    });
}

/**
 * Get course with all its content
 */
export function useCourseWithContent(courseId: string | undefined) {
    return useQuery({
        queryKey: courseKeys.withContent(courseId!),
        queryFn: () => courseService.getCourseWithContent(courseId!),
        enabled: !!courseId,
    });
}

/**
 * Get courses by exam goal
 */
export function useCoursesByExamGoal(examGoal: string | undefined) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: courseKeys.filtered(coachingId!, { examGoal }),
        queryFn: () => courseService.getCoursesByExamGoal(coachingId!, examGoal!),
        enabled: !!coachingId && !!examGoal,
    });
}

/**
 * Get free courses
 */
export function useFreeCourses() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: courseKeys.free(coachingId!),
        queryFn: () => courseService.getFreeCourses(coachingId!),
        enabled: !!coachingId,
    });
}

/**
 * Search courses
 */
export function useSearchCourses(searchTerm: string) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: ['courses', coachingId, 'search', searchTerm],
        queryFn: () => courseService.searchCourses(coachingId!, searchTerm),
        enabled: !!coachingId && searchTerm.length > 0,
    });
}

/**
 * Create a new course
 */
export function useCreateCourse() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (courseData: Partial<Course>) =>
            courseService.createCourse({ ...courseData, coaching_id: coachingId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.all(coachingId!) });
        },
    });
}

/**
 * Update a course
 */
export function useUpdateCourse() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ courseId, updates }: { courseId: string; updates: Partial<Course> }) =>
            courseService.updateCourse(courseId, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: courseKeys.all(coachingId!) });
        },
    });
}

/**
 * Delete a course — also cleans up R2 files and media_files records.
 */
export function useDeleteCourse() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: async (courseId: string) => {
            // 1. Fetch all content media URLs for this course so we can delete from R2
            const { supabase } = await import('@/config/supabase');
            const { data: contentRows } = await supabase
                .from('course_content')
                .select('media_url')
                .eq('course_id', courseId)
                .not('media_url', 'is', null);

            // 2. Delete each file from R2 + media_files (non-blocking, best-effort)
            const r2 = (await import('@/services/r2.service')).default;
            if (contentRows?.length) {
                await Promise.allSettled(
                    contentRows
                        .filter((c: any) => c.media_url)
                        .map((c: any) => r2.remove(c.media_url))
                );
            }

            // 3. Delete the course (cascades to course_content via FK)
            return courseService.deleteCourse(courseId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.all(coachingId!) });
            queryClient.invalidateQueries({ queryKey: ['superadmin-storage'] });
        },
    });
}


/**
 * Create course content
 */
export function useCreateCourseContent() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ courseId, contentData }: { courseId: string; contentData: any }) =>
            courseService.createCourseContent({ ...contentData, coaching_id: coachingId!, course_id: courseId }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.withContent(variables.courseId) });
        },
    });
}
