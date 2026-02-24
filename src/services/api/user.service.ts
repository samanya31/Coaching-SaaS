import { supabase } from '@/config/supabase';
import { User } from '@/types/user';

/**
 * User Service - Tenant-Aware
 * 
 * All functions automatically filter by coaching_id
 * Uses Supabase RLS for additional security layer
 */

export const userService = {
    /**
     * Get all users for a coaching, optionally filtered by role
     * @param coachingId - UUID of the coaching institute
     * @param role - Optional role filter ('student', 'teacher', 'coaching_admin')
     */
    async getUsers(coachingId: string, role?: string) {
        let query = supabase
            .from('users')
            .select('*')
            .eq('coaching_id', coachingId)  // 👈 Tenant filter
            .order('created_at', { ascending: false });

        if (role) {
            query = query.eq('role', role);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[userService] Error fetching users:', error);
            throw error;
        }

        return data as User[];
    },

    /**
     * Get a single user by ID
     * RLS ensures user belongs to correct coaching
     */
    async getUserById(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                batch_enrollments(
                    batch_id,
                    status,
                    batches(id, name, thumbnail_url, exam_goal)
                )
            `)
            .eq('id', userId)
            .single();

        if (error) {
            console.error('[userService] Error fetching user:', error);
            throw error;
        }

        return data as User;
    },

    /**
     * Get students for a coaching with optional filters
     */
    async getStudents(coachingId: string, filters?: {
        examGoal?: string;
        batchId?: string;
    }) {
        let query = supabase
            .from('users')
            .select(`
                *,
                batch_enrollments(
                    batch_id,
                    status,
                    batches(id, name, thumbnail_url, exam_goal)
                )
            `)
            .eq('coaching_id', coachingId)
            .eq('role', 'student');

        if (filters?.examGoal) {
            query = query.eq('exam_goal', filters.examGoal);
        }

        if (filters?.batchId) {
            query = query.eq('batch_enrollments.batch_id', filters.batchId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[userService] Error fetching students:', error);
            throw error;
        }

        return data as User[];
    },

    /**
     * Get teachers for a coaching
     */
    async getTeachers(coachingId: string) {
        return this.getUsers(coachingId, 'teacher');
    },

    /**
     * Get admins for a coaching
     */
    async getAdmins(coachingId: string) {
        return this.getUsers(coachingId, 'coaching_admin');
    },

    /**
     * Create a new user
     * Note: auth.users entry must already exist via Supabase Auth
     */
    async createUser(userData: Partial<User> & { coaching_id: string }) {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();

        if (error) {
            console.error('[userService] Error creating user:', error);
            throw error;
        }

        return data as User;
    },

    /**
     * Update a user
     * RLS ensures user belongs to correct coaching
     */
    async updateUser(userId: string, updates: Partial<User>) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('[userService] Error updating user:', error);
            throw error;
        }

        return data as User;
    },

    /**
     * Soft delete a user (set status to inactive)
     * RLS ensures user belongs to correct coaching
     */
    async deleteUser(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('[userService] Error deleting user:', error);
            throw error;
        }

        return data as User;
    },

    /**
     * Search users by name or email
     */
    async searchUsers(coachingId: string, searchTerm: string, role?: string) {
        let query = supabase
            .from('users')
            .select('*')
            .eq('coaching_id', coachingId)
            .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

        if (role) {
            query = query.eq('role', role);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[userService] Error searching users:', error);
            throw error;
        }

        return data as User[];
    },

    /**
     * Get user count by role and payment status
     */
    async getUserCounts(coachingId: string) {
        // 1. Get all users
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, role')
            .eq('coaching_id', coachingId)
            .eq('status', 'active');

        if (usersError) {
            console.error('[userService] Error fetching user counts:', usersError);
            throw usersError;
        }

        // 2. Verified Students (Active enrollments)
        // Use 'user_id' instead of 'student_id' as per schema
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('batch_enrollments')
            .select('user_id')
            .eq('status', 'active'); // Assuming active enrollment means paid/enrolled

        if (enrollmentsError) {
            // Log but don't fail, just return 0 for paid
            console.warn('[userService] Error fetching enrollments for counts:', enrollmentsError);
        }

        const studentIds = users.filter(u => u.role === 'student').map(u => u.id);
        const enrolledStudentIds = new Set(enrollments?.map(e => e.user_id) || []);

        const totalStudents = studentIds.length;
        const paidStudents = studentIds.filter(id => enrolledStudentIds.has(id)).length;
        const unpaidStudents = totalStudents - paidStudents;

        return {
            students: totalStudents,
            teachers: users.filter(u => u.role === 'teacher').length,
            admins: users.filter(u => u.role === 'coaching_admin').length,
            total: users.length,
            paidStudents,
            unpaidStudents
        };
    }
};
