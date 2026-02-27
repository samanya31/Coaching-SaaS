import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export interface SaasPlan {
    id: string;
    name: string;
    slug: string;
    price_monthly: number;
    price_yearly: number;
    max_students: number;
    max_storage_gb: number;
    live_classes: boolean;
    tests_enabled: boolean;
    payments_enabled: boolean;
    custom_domain: boolean;
    support_level: string;
    is_popular: boolean;
    is_active: boolean;
    sort_order: number;
    description: string | null;
    created_at: string;
}

const fetchPlans = async (): Promise<SaasPlan[]> => {
    const { data, error } = await supabase
        .from('saas_plans')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const useSaasPlans = () =>
    useQuery({ queryKey: ['saas-plans'], queryFn: fetchPlans, staleTime: 60_000 });

export const useUpsertSaasPlan = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (plan: Partial<SaasPlan> & { id?: string }) => {
            if (plan.id) {
                const { error } = await supabase.from('saas_plans').update(plan).eq('id', plan.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('saas_plans').insert(plan);
                if (error) throw error;
            }
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['saas-plans'] }),
    });
};

export const useDeleteSaasPlan = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('saas_plans').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['saas-plans'] }),
    });
};
