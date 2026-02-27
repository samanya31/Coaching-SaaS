import { motion } from 'framer-motion';
import {
    Building2,
    CheckCircle2,
    Users,
    TrendingUp,
    DollarSign,
    Zap,
    HardDrive,
    RefreshCw,
    IndianRupee,
    Clock,
    ArrowUpRight,
} from 'lucide-react';
import { useSuperAdminMetrics } from '@/hooks/data/useSuperAdminMetrics';
import { useQueryClient } from '@tanstack/react-query';

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);
const fmtRupee = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${fmt(n)}`;

const statusColor = (s: string) =>
    s === 'paid' ? 'bg-emerald-100 text-emerald-700' :
        s === 'pending' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700';

interface KpiCard {
    title: string;
    value: string;
    sub?: string;
    icon: any;
    iconBg: string;
}

export const SuperAdminDashboard = () => {
    const { data: metrics, isLoading, error, dataUpdatedAt } = useSuperAdminMetrics();
    const queryClient = useQueryClient();

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['superadmin-metrics'] });

    const cards: KpiCard[] = metrics ? [
        {
            title: 'Total Institutes',
            value: fmt(metrics.totalInstitutes),
            sub: 'Registered on platform',
            icon: Building2,
            iconBg: 'bg-indigo-100 text-indigo-600',
        },
        {
            title: 'Active Institutes',
            value: fmt(metrics.activeInstitutes),
            sub: `${metrics.totalInstitutes > 0 ? Math.round((metrics.activeInstitutes / metrics.totalInstitutes) * 100) : 0}% of total`,
            icon: CheckCircle2,
            iconBg: 'bg-emerald-100 text-emerald-600',
        },
        {
            title: 'Total Students',
            value: fmt(metrics.totalStudents),
            sub: 'Platform-wide',
            icon: Users,
            iconBg: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Monthly Revenue',
            value: fmtRupee(metrics.monthlyRevenue),
            sub: 'Your SaaS income this month',
            icon: TrendingUp,
            iconBg: 'bg-amber-100 text-amber-600',
        },
        {
            title: 'Lifetime Revenue',
            value: fmtRupee(metrics.lifetimeRevenue),
            sub: 'Total SaaS income ever',
            icon: DollarSign,
            iconBg: 'bg-purple-100 text-purple-600',
        },
        {
            title: 'Active Subscriptions',
            value: fmt(metrics.activeSubscriptions),
            sub: 'Institutes paid this month',
            icon: Zap,
            iconBg: 'bg-orange-100 text-orange-600',
        },
        {
            title: 'Storage Used',
            value: '0 GB',
            sub: 'Tracking coming soon',
            icon: HardDrive,
            iconBg: 'bg-rose-100 text-rose-600',
        },
    ] : [];

    const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        <Clock className="inline w-3 h-3 mr-1" />
                        Last updated: {lastUpdated}
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    Failed to load metrics. Make sure the saas_billing table exists and RLS policies are applied.
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-3/4" />
                        </div>
                    ))
                    : cards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                                    <card.icon className="w-4 h-4" />
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300" />
                            </div>
                            <p className="text-xs font-medium text-gray-500 mb-1">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900 leading-tight">{card.value}</p>
                            {card.sub && <p className="text-[11px] text-gray-400 mt-1">{card.sub}</p>}
                        </motion.div>
                    ))
                }
            </div>

            {/* Recent Billing Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-indigo-500" />
                        <h2 className="font-semibold text-gray-800">Recent Billing</h2>
                    </div>
                    <span className="text-xs text-gray-400">Last 8 invoices you received</span>
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : !metrics?.recentBilling?.length ? (
                    <div className="py-16 text-center text-gray-400">
                        <IndianRupee className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                        <p className="font-medium text-gray-500">No billing records yet</p>
                        <p className="text-sm mt-1">
                            Insert your first row into the <code className="bg-gray-100 px-1 rounded">saas_billing</code> table.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left bg-gray-50">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Institute</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {metrics.recentBilling.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                                </div>
                                                <span className="font-medium text-gray-800 text-sm">{bill.coaching_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium capitalize">
                                                {bill.plan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 text-sm">
                                            {fmtRupee(bill.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 capitalize">{bill.billing_period}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(bill.invoice_date).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColor(bill.status)}`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
