import { supabase } from '@/config/supabase';

export interface Role {
    id: string;
    coaching_id: string;
    name: string;
    code: string;
    permissions: string[];
    is_system: boolean;
    created_at: string;
}

export const roleService = {
    /**
     * Get all roles for a coaching (including system roles)
     */
    async getRoles(coachingId: string) {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .or(`coaching_id.eq.${coachingId},is_system.eq.true`)
            .order('name');

        if (error) {
            console.error('[roleService] Error fetching roles:', error);
            throw error;
        }

        return data as Role[];
    },

    /**
     * Create a new custom role
     */
    async createRole(roleData: Partial<Role> & { coaching_id: string }) {
        const { data, error } = await supabase
            .from('roles')
            .insert([roleData])
            .select()
            .single();

        if (error) {
            console.error('[roleService] Error creating role:', error);
            throw error;
        }

        return data as Role;
    },

    /**
     * Update a role
     */
    async updateRole(id: string, updates: Partial<Role>) {
        const { data, error } = await supabase
            .from('roles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[roleService] Error updating role:', error);
            throw error;
        }

        return data as Role;
    },

    /**
     * Delete a role
     */
    async deleteRole(id: string) {
        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[roleService] Error deleting role:', error);
            throw error;
        }
    }
};
