import { supabase } from '@/config/supabase';
import { Course } from '@/types/course';

/**
 * Course Service - Tenant-Aware
 * 
 * All functions automatically filter by coaching_id
 */

export const courseService = {
    /**
     * Get all courses for a coaching
     */
    async getCourses(coachingId: string, filters?: {
        category?: string;
        examGoal?: string;
        status?: string;
        batchId?: string;
    }) {
        let query = supabase
            .from('courses')
            .select('*')
            .eq('coaching_id', coachingId)
            .order('created_at', { ascending: false });

        if (filters?.category) {
            query = query.eq('category', filters.category);
        }

        if (filters?.examGoal) {
            query = query.eq('exam_goal', filters.examGoal);
        }

        if (filters?.batchId) {
            query = query.eq('batch_id', filters.batchId);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        } else {
            // If fetching by batchId, we might want draft courses too if admin? 
            // Stick to published for now unless specified
            query = query.eq('status', 'published');
        }

        const { data, error } = await query;

        if (error) {
            console.error('[courseService] Error fetching courses:', error);
            throw error;
        }

        return data as Course[];
    },

    /**
     * Get a single course by ID
     */
    async getCourseById(courseId: string) {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (error) {
            console.error('[courseService] Error fetching course:', error);
            throw error;
        }

        return data as Course;
    },

    /**
     * Get course with its content
     */
    async getCourseWithContent(courseId: string) {
        const { data, error } = await supabase
            .from('courses')
            .select(`
        *,
        course_content(
          id,
          title,
          type,
          media_url,
          duration_seconds,
          section,
          order_index,
          is_free,
          status
        )
      `)
            .eq('id', courseId)
            .order('order_index', { foreignTable: 'course_content', ascending: true })
            .single();

        if (error) {
            console.error('[courseService] Error fetching course with content:', error);
            throw error;
        }

        return data;
    },

    /**
     * Create a new course
     */
    async createCourse(courseData: Partial<Course> & { coaching_id: string }) {
        const { data, error } = await supabase
            .from('courses')
            .insert([courseData])
            .select()
            .single();

        if (error) {
            console.error('[courseService] Error creating course:', error);
            throw error;
        }

        return data as Course;
    },

    /**
     * Update a course
     */
    async updateCourse(courseId: string, updates: Partial<Course>) {
        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId)
            .select()
            .single();

        if (error) {
            console.error('[courseService] Error updating course:', error);
            throw error;
        }

        return data as Course;
    },

    /**
     * Delete a course (soft delete by setting status to archived)
     */
    async deleteCourse(courseId: string) {
        const { data, error } = await supabase
            .from('courses')
            .update({ status: 'archived' })
            .eq('id', courseId)
            .select()
            .single();

        if (error) {
            console.error('[courseService] Error deleting course:', error);
            throw error;
        }

        return data as Course;
    },

    /**
     * Get courses by exam goal
     */
    async getCoursesByExamGoal(coachingId: string, examGoal: string) {
        return this.getCourses(coachingId, { examGoal, status: 'published' });
    },

    /**
     * Get free courses
     */
    async getFreeCourses(coachingId: string) {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('coaching_id', coachingId)
            .eq('is_free', true)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[courseService] Error fetching free courses:', error);
            throw error;
        }

        return data as Course[];
    },

    /**
     * Search courses by title or description
     */
    async searchCourses(coachingId: string, searchTerm: string) {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('coaching_id', coachingId)
            .eq('status', 'published')
            .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[courseService] Error searching courses:', error);
            throw error;
        }

        return data as Course[];
    },

    /**
    * Create content for a course
    */
    async createCourseContent(contentData: Partial<any> & { coaching_id: string; course_id: string }) {
        const { data, error } = await supabase
            .from('course_content')
            .insert([contentData])
            .select()
            .single();

        if (error) {
            console.error('[courseService] Error creating course content:', error);
            throw error;
        }

        return data;
    }
};
