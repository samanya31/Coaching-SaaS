import { supabase } from '@/config/supabase';
import { Lead } from '@/types/lead';

export const leadService = {
    /**
     * Get all leads for a coaching
     */
    getLeads: async (coachingId: string): Promise<Lead[]> => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('coaching_id', coachingId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Create a new lead
     */
    createLead: async (lead: Partial<Lead>): Promise<Lead> => {
        const { data, error } = await supabase
            .from('leads')
            .insert(lead)
            .select()
            .single();

        if (error) {
            console.error('Error creating lead:', error);
            throw error;
        }

        return data;
    },

    /**
     * Update a lead status
     */
    updateLeadStatus: async (leadId: string, status: string): Promise<Lead> => {
        const { data, error } = await supabase
            .from('leads')
            .update({ status })
            .eq('id', leadId)
            .select()
            .single();

        if (error) {
            console.error('Error updating lead status:', error);
            throw error;
        }

        return data;
    },

    /**
     * Delete a lead
     */
    deleteLead: async (leadId: string): Promise<void> => {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', leadId);

        if (error) {
            console.error('Error deleting lead:', error);
            throw error;
        }
    }
};
