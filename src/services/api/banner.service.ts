import { supabase } from '@/config/supabase';
import { Banner } from '@/types/banner';
import r2 from '@/services/r2.service';

/**
 * Banner Service - Tenant-Aware
 * 
 * All functions automatically filter by coaching_id
 */

export const bannerService = {
    /**
     * Get all banners for a coaching
     */
    async getBanners(coachingId: string, activeOnly: boolean = false) {
        let query = supabase
            .from('banners')
            .select('*')
            .eq('coaching_id', coachingId)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[bannerService] Error fetching banners:', error);
            throw error;
        }

        return data as Banner[];
    },

    /**
     * Get a single banner by ID
     */
    async getBannerById(bannerId: string) {
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .eq('id', bannerId)
            .single();

        if (error) {
            console.error('[bannerService] Error fetching banner:', error);
            throw error;
        }

        return data as Banner;
    },

    /**
     * Create a new banner
     */
    async createBanner(bannerData: Partial<Banner> & { coaching_id: string }) {
        const { data, error } = await supabase
            .from('banners')
            .insert([bannerData])
            .select()
            .single();

        if (error) {
            console.error('[bannerService] Error creating banner:', error);
            throw error;
        }

        return data as Banner;
    },

    /**
     * Update a banner
     */
    async updateBanner(bannerId: string, updates: Partial<Banner>) {
        const { data, error } = await supabase
            .from('banners')
            .update(updates)
            .eq('id', bannerId)
            .select()
            .single();

        if (error) {
            console.error('[bannerService] Error updating banner:', error);
            throw error;
        }

        return data as Banner;
    },

    /**
     * Delete a banner (and its R2 image)
     */
    async deleteBanner(bannerId: string) {
        try {
            // 1. Get banner details to find the image URL
            const banner = await this.getBannerById(bannerId);

            // 2. Delete from R2 (and media_files table)
            if (banner && banner.image_url) {
                // Only attempt if it looks like an R2 URL (not a demo/external URL)
                if (banner.image_url.includes('r2.dev') || banner.image_url.includes('exam-edge-media')) {
                    await r2.remove(banner.image_url);
                }
            }

            // 3. Delete the database record
            const { error } = await supabase
                .from('banners')
                .delete()
                .eq('id', bannerId);

            if (error) {
                console.error('[bannerService] Error deleting banner record:', error);
                throw error;
            }

            return { success: true };
        } catch (error) {
            console.error('[bannerService] Failed to delete banner:', error);
            throw error;
        }
    },

    /**
     * Toggle banner active status
     */
    async toggleBannerStatus(bannerId: string, isActive: boolean) {
        return this.updateBanner(bannerId, { is_active: isActive });
    }
};
