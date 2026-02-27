import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export interface BillingRecord {
    id: string;
    coaching_id: string;
    coaching_name: string;
    amount: number;
    plan: string;
    billing_period: string;
    status: string;
    invoice_date: string;
    transaction_id: string | null;
    notes: string | null;
}

export interface FinanceMetrics {
    mrr: number;
    arr: number;
    totalCollected: number;
    failedAmount: number;
    pendingCount: number;
    failedCount: number;
    monthlyChart: { month: string; revenue: number; count: number }[];
    recentPayments: BillingRecord[];
    failedPayments: BillingRecord[];
    upcomingExpirations: {
        id: string;
        name: string;
        plan: string;
        subscription_ends_at: string;
        daysLeft: number;
    }[];
}

const getMonthKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (key: string) => {
    const [y, m] = key.split('-');
    return new Date(+y, +m - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
};

// Last 8 months keys
const last8Months = (): string[] => {
    const months: string[] = [];
    for (let i = 7; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        months.push(getMonthKey(d));
    }
    return months;
};

const fetchFinance = async (): Promise<FinanceMetrics> => {
    const [billingRes, expRes] = await Promise.all([
        supabase
            .from('saas_billing')
            .select(`id, coaching_id, amount, plan, billing_period, status, invoice_date, transaction_id, notes, coachings (name)`)
            .order('invoice_date', { ascending: false }),
        supabase
            .from('coachings')
            .select('id, name, plan, subscription_ends_at')
            .not('subscription_ends_at', 'is', null)
            .order('subscription_ends_at', { ascending: true }),
    ]);

    const billing: BillingRecord[] = (billingRes.data || []).map((r: any) => ({
        id: r.id,
        coaching_id: r.coaching_id,
        coaching_name: r.coachings?.name || 'Unknown',
        amount: r.amount,
        plan: r.plan,
        billing_period: r.billing_period,
        status: r.status,
        invoice_date: r.invoice_date,
        transaction_id: r.transaction_id,
        notes: r.notes,
    }));

    const paid = billing.filter(b => b.status === 'paid');
    const failed = billing.filter(b => b.status === 'failed');
    const pending = billing.filter(b => b.status === 'pending');

    // MRR = paid billing this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const mrr = paid
        .filter(b => b.invoice_date >= startOfMonth)
        .reduce((s, b) => s + Number(b.amount), 0);

    const totalCollected = paid.reduce((s, b) => s + Number(b.amount), 0);
    const failedAmount = failed.reduce((s, b) => s + Number(b.amount), 0);

    // Build monthly chart for last 8 months
    const months = last8Months();
    const monthlyMap: Record<string, { revenue: number; count: number }> = {};
    months.forEach(m => { monthlyMap[m] = { revenue: 0, count: 0 }; });

    paid.forEach(b => {
        const key = b.invoice_date.substring(0, 7);
        if (monthlyMap[key]) {
            monthlyMap[key].revenue += Number(b.amount);
            monthlyMap[key].count += 1;
        }
    });

    const monthlyChart = months.map(m => ({
        month: monthLabel(m),
        revenue: monthlyMap[m].revenue,
        count: monthlyMap[m].count,
    }));

    // Upcoming expirations (within 30 days)
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    const upcomingExpirations = (expRes.data || [])
        .filter((c: any) => {
            const d = new Date(c.subscription_ends_at);
            return d <= in30;
        })
        .map((c: any) => {
            const daysLeft = Math.ceil(
                (new Date(c.subscription_ends_at).getTime() - Date.now()) / 86_400_000
            );
            return { id: c.id, name: c.name, plan: c.plan, subscription_ends_at: c.subscription_ends_at, daysLeft };
        });

    return {
        mrr,
        arr: mrr * 12,
        totalCollected,
        failedAmount,
        pendingCount: pending.length,
        failedCount: failed.length,
        monthlyChart,
        recentPayments: billing.filter(b => b.status === 'paid').slice(0, 10),
        failedPayments: failed,
        upcomingExpirations,
    };
};

export const useFinanceMetrics = () =>
    useQuery({ queryKey: ['superadmin-finance'], queryFn: fetchFinance, staleTime: 60_000 });
