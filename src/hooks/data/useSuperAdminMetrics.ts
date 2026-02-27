import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export interface SuperAdminMetrics {
    totalInstitutes: number;
    activeInstitutes: number;
    totalStudents: number;
    monthlyRevenue: number;
    lifetimeRevenue: number;
    activeSubscriptions: number;
    recentBilling: RecentBill[];
}

export interface RecentBill {
    id: string;
    coaching_name: string;
    amount: number;
    plan: string;
    billing_period: string;
    status: string;
    invoice_date: string;
    transaction_id: string | null;
}

const startOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
};

const fetchMetrics = async (): Promise<SuperAdminMetrics> => {
    const [
        institutesRes,
        activeInstRes,
        studentsRes,
        monthlyRevRes,
        lifetimeRevRes,
        activeSubsRes,
        recentBillingRes,
    ] = await Promise.all([
        // Total institutes
        supabase.from('coachings').select('id', { count: 'exact', head: true }),

        // Active institutes (if status column exists)
        supabase.from('coachings').select('id', { count: 'exact', head: true }).eq('status', 'active'),

        // Total students
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),

        // Monthly revenue (YOUR SaaS fee from saas_billing)
        supabase.from('saas_billing')
            .select('amount')
            .eq('status', 'paid')
            .gte('invoice_date', startOfMonth()),

        // Lifetime revenue
        supabase.from('saas_billing')
            .select('amount')
            .eq('status', 'paid'),

        // Active subscriptions = distinct institutes with a paid bill this month
        supabase.from('saas_billing')
            .select('coaching_id')
            .eq('status', 'paid')
            .gte('invoice_date', startOfMonth()),

        // Recent billing (last 8)
        supabase.from('saas_billing')
            .select(`id, amount, plan, billing_period, status, invoice_date, transaction_id, coachings ( name )`)
            .order('invoice_date', { ascending: false })
            .limit(8),
    ]);

    const sumAmounts = (rows: { amount: number }[] | null) =>
        (rows || []).reduce((acc, r) => acc + Number(r.amount), 0);

    const distinctInstitutes = new Set(
        (activeSubsRes.data || []).map((r: any) => r.coaching_id)
    ).size;

    const recentBilling: RecentBill[] = (recentBillingRes.data || []).map((r: any) => ({
        id: r.id,
        coaching_name: r.coachings?.name || 'Unknown',
        amount: r.amount,
        plan: r.plan,
        billing_period: r.billing_period,
        status: r.status,
        invoice_date: r.invoice_date,
        transaction_id: r.transaction_id,
    }));

    return {
        totalInstitutes: institutesRes.count ?? 0,
        activeInstitutes: activeInstRes.count ?? 0,
        totalStudents: studentsRes.count ?? 0,
        monthlyRevenue: sumAmounts(monthlyRevRes.data),
        lifetimeRevenue: sumAmounts(lifetimeRevRes.data),
        activeSubscriptions: distinctInstitutes,
        recentBilling,
    };
};

export const useSuperAdminMetrics = () => {
    return useQuery({
        queryKey: ['superadmin-metrics'],
        queryFn: fetchMetrics,
        staleTime: 60_000,
        refetchOnWindowFocus: true,
    });
};
