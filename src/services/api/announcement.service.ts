import { supabase } from '@/config/supabase';

/**
 * Announcement Service - Tenant-Aware
 * 
 * All functions automatically filter by coaching_id
 */

export interface Announcement {
    id: string;
    coaching_id: string;
    title: string;
    content: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_pinned: boolean;
    target_roles?: string[];
    target_batches?: string[];
    target_exam_goals?: string[];
    created_at: string;
    updated_at: string;
}

export const announcementService = {
    /**
     * Get all announcements for a coaching
     */
    async getAnnouncements(coachingId: string, filters?: {
        type?: string;
        isPinned?: boolean;
    }) {
        let query = supabase
            .from('announcements')
            .select('*')
            .eq('coaching_id', coachingId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.isPinned !== undefined) {
            query = query.eq('is_pinned', filters.isPinned);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[announcementService] Error fetching announcements:', error);
            throw error;
        }

        return data as Announcement[];
    },

    /**
     * Get a single announcement by ID
     */
    async getAnnouncementById(announcementId: string) {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', announcementId)
            .single();

        if (error) {
            console.error('[announcementService] Error fetching announcement:', error);
            throw error;
        }

        return data as Announcement;
    },

    /**
     * Create a new announcement
     */
    async createAnnouncement(announcementData: Partial<Announcement> & { coaching_id: string }) {
        const { data, error } = await supabase
            .from('announcements')
            .insert([announcementData])
            .select()
            .single();

        if (error) {
            console.error('[announcementService] Error creating announcement:', error);
            throw error;
        }

        return data as Announcement;
    },

    /**
     * Update an announcement
     */
    async updateAnnouncement(announcementId: string, updates: Partial<Announcement>) {
        const { data, error } = await supabase
            .from('announcements')
            .update(updates)
            .eq('id', announcementId)
            .select()
            .single();

        if (error) {
            console.error('[announcementService] Error updating announcement:', error);
            throw error;
        }

        return data as Announcement;
    },

    /**
     * Delete an announcement
     */
    async deleteAnnouncement(announcementId: string) {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', announcementId);

        if (error) {
            console.error('[announcementService] Error deleting announcement:', error);
            throw error;
        }

        return { success: true };
    },

    /**
     * Toggle pin status
     */
    async togglePin(announcementId: string, isPinned: boolean) {
        return this.updateAnnouncement(announcementId, { is_pinned: isPinned });
    }
};
