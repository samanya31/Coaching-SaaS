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
 * Delete a course (soft delete)
 */
export function useDeleteCourse() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (courseId: string) => courseService.deleteCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.all(coachingId!) });
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
