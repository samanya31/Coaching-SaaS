import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export interface Institute {
    id: string;
    name: string;
    slug: string;
    subdomain: string | null;
    logo_url: string | null;
    plan: string;
    plan_id: string | null;
    subscription_status: string;
    subscription_ends_at: string | null;
    status: string;
    created_at: string;
    // joined
    owner_name: string | null;
    owner_email: string | null;
    student_count: number;
}

const fetchInstitutes = async (): Promise<Institute[]> => {
    // Fetch all coachings
    const { data: coachings, error } = await supabase
        .from('coachings')
        .select('id, name, slug, subdomain, logo_url, plan, plan_id, subscription_status, subscription_ends_at, status, created_at')
        .order('created_at', { ascending: false });

    if (error) throw error;
    if (!coachings?.length) return [];

    // For each coaching, fetch owner (coaching_admin) + student count in parallel
    const enriched = await Promise.all(
        coachings.map(async (c) => {
            const [ownerRes, countRes] = await Promise.all([
                supabase
                    .from('users')
                    .select('full_name, email')
                    .eq('coaching_id', c.id)
                    .eq('role', 'coaching_admin')
                    .maybeSingle(),
                supabase
                    .from('users')
                    .select('id', { count: 'exact', head: true })
                    .eq('coaching_id', c.id)
                    .eq('role', 'student'),
            ]);

            return {
                ...c,
                owner_name: ownerRes.data?.full_name ?? null,
                owner_email: ownerRes.data?.email ?? null,
                student_count: countRes.count ?? 0,
            } as Institute;
        })
    );

    return enriched;
};

export const useInstitutes = () =>
    useQuery({ queryKey: ['superadmin-institutes'], queryFn: fetchInstitutes, staleTime: 30_000 });

// Update institute status (active / suspended / trial / expired)
export const useUpdateInstituteStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase.from('coachings').update({ status }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin-institutes'] }),
    });
};

// Update plan
export const useUpdateInstitutePlan = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, plan }: { id: string; plan: string }) => {
            const { error } = await supabase.from('coachings').update({ plan }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['superadmin-institutes'] }),
    });
};
