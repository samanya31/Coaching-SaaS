import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, IndianRupee, AlertTriangle, Clock, RefreshCw,
    CheckCircle2, XCircle, Plus, X, Loader2, Calendar,
    Building2, FileText, ArrowUpRight,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { useFinanceMetrics, BillingRecord } from '@/hooks/data/useFinanceMetrics';
import { supabase } from '@/config/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useSaasPlans } from '@/hooks/data/useSaasPlans';
import { useInstitutes } from '@/hooks/data/useInstitutes';

// ── Helpers ──────────────────────────────────────────────────────────
const fmtRupee = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
        : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K`
            : `₹${n.toLocaleString('en-IN')}`;

const fmtFull = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const statusStyle: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
};

// ── KPI Card ─────────────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, icon: Icon, iconBg, index }: {
    title: string; value: string; sub?: string; icon: any; iconBg: string; index: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
    >
        <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-xl ${iconBg}`}><Icon className="w-4 h-4" /></div>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-300" />
        </div>
        <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </motion.div>
);

// ── Manual Payment Modal ──────────────────────────────────────────────
const ManualPaymentModal = ({ onClose }: { onClose: () => void }) => {
    const { data: institutes = [] } = useInstitutes();
    const { data: plans = [] } = useSaasPlans();
    const qc = useQueryClient();
    const [form, setForm] = useState({
        coaching_id: '',
        amount: '',
        plan: '',
        billing_period: 'monthly',
        status: 'paid',
        invoice_date: new Date().toISOString().split('T')[0],
        transaction_id: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.coaching_id || !form.amount || !form.plan) {
            setError('Institute, amount and plan are required.');
            return;
        }
        setLoading(true);
        setError('');
        const { error: dbErr } = await supabase.from('saas_billing').insert({
            coaching_id: form.coaching_id,
            amount: parseFloat(form.amount),
            plan: form.plan,
            billing_period: form.billing_period,
            status: form.status,
            invoice_date: form.invoice_date,
            transaction_id: form.transaction_id || null,
            notes: form.notes || null,
        });
        setLoading(false);
        if (dbErr) { setError(dbErr.message); return; }
        qc.invalidateQueries({ queryKey: ['superadmin-finance'] });
        qc.invalidateQueries({ queryKey: ['superadmin-metrics'] });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-900">Add Manual Payment</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Institute */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Institute *</label>
                        <select value={form.coaching_id} onChange={e => set('coaching_id', e.target.value)} required
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                            <option value="">Select institute...</option>
                            {institutes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>

                    {/* Amount + Plan */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Amount (₹) *</label>
                            <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} required min="1"
                                placeholder="2499"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Plan *</label>
                            <select value={form.plan} onChange={e => set('plan', e.target.value)} required
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="">Select...</option>
                                {plans.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Billing Period + Status */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Billing Period</label>
                            <select value={form.billing_period} onChange={e => set('billing_period', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Status</label>
                            <select value={form.status} onChange={e => set('status', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    {/* Invoice Date */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Invoice Date</label>
                        <input type="date" value={form.invoice_date} onChange={e => set('invoice_date', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>

                    {/* Transaction ID */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Transaction ID (optional)</label>
                        <input type="text" value={form.transaction_id} onChange={e => set('transaction_id', e.target.value)}
                            placeholder="RZP_12345"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Notes (optional)</label>
                        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ── Payment Table Row ─────────────────────────────────────────────────
const PaymentRow = ({ bill }: { bill: BillingRecord }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-5 py-3">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-800 text-sm">{bill.coaching_name}</span>
            </div>
        </td>
        <td className="px-4 py-3">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium capitalize">{bill.plan}</span>
        </td>
        <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{fmtFull(bill.amount)}</td>
        <td className="px-4 py-3 text-xs text-gray-500 capitalize">{bill.billing_period}</td>
        <td className="px-4 py-3 text-xs text-gray-500">
            {new Date(bill.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </td>
        <td className="px-4 py-3">
            {bill.transaction_id
                ? <span className="text-[11px] font-mono text-gray-400">{bill.transaction_id}</span>
                : <span className="text-[11px] text-gray-300">—</span>
            }
        </td>
        <td className="px-4 py-3">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusStyle[bill.status] || 'bg-gray-100 text-gray-500'}`}>
                {bill.status}
            </span>
        </td>
    </tr>
);

// ── Custom Tooltip for chart ──────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-2.5 text-sm">
            <p className="font-semibold text-gray-800 mb-1">{label}</p>
            <p className="text-indigo-600 font-bold">{fmtFull(payload[0]?.value || 0)}</p>
            <p className="text-gray-400 text-xs">{payload[1]?.value || 0} payments</p>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────
export const SuperAdminFinance = () => {
    const { data: metrics, isLoading, error } = useFinanceMetrics();
    const qc = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'history' | 'failed' | 'expirations'>('history');

    const kpis = metrics ? [
        { title: 'Monthly Revenue (MRR)', value: fmtRupee(metrics.mrr), sub: 'Paid invoices this month', icon: TrendingUp, iconBg: 'bg-indigo-100 text-indigo-600' },
        { title: 'Annual Run Rate (ARR)', value: fmtRupee(metrics.arr), sub: 'MRR × 12', icon: IndianRupee, iconBg: 'bg-purple-100 text-purple-600' },
        { title: 'Total Collected', value: fmtRupee(metrics.totalCollected), sub: 'All-time paid', icon: CheckCircle2, iconBg: 'bg-emerald-100 text-emerald-600' },
        { title: 'Failed Revenue', value: fmtRupee(metrics.failedAmount), sub: `${metrics.failedCount} failed payments`, icon: AlertTriangle, iconBg: 'bg-red-100 text-red-600' },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Your SaaS revenue from coaching institutes</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => qc.invalidateQueries({ queryKey: ['superadmin-finance'] })}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Payment
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    Failed to load finance data. Make sure <code>saas_billing</code> table exists.
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-8 mb-3" />
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                            <div className="h-6 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))
                    : kpis.map((k, i) => <KpiCard key={k.title} {...k} index={i} />)
                }
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="font-semibold text-gray-800">Revenue Trend</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Last 8 months of SaaS billing</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                </div>

                {isLoading ? (
                    <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                ) : (
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={metrics?.monthlyChart} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => fmtRupee(v)} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2.5} fill="url(#revGradient)" dot={{ fill: '#6366F1', r: 3 }} />
                            <Bar dataKey="count" fill="#C7D2FE" radius={[4, 4, 0, 0]} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Tab headers */}
                <div className="flex border-b border-gray-100">
                    {([
                        { key: 'history', label: 'Payment History', icon: FileText },
                        { key: 'failed', label: `Failed (${metrics?.failedCount ?? 0})`, icon: XCircle },
                        { key: 'expirations', label: `Expiring Soon (${metrics?.upcomingExpirations?.length ?? 0})`, icon: Clock },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.key
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Payment History */}
                {activeTab === 'history' && (
                    isLoading ? (
                        <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                    ) : !metrics?.recentPayments?.length ? (
                        <div className="py-16 text-center text-gray-400">
                            <IndianRupee className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                            <p className="font-medium text-gray-500">No payments yet</p>
                            <p className="text-sm mt-1">Click <strong>Add Payment</strong> to record your first invoice.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="bg-gray-50 text-left">
                                    {['Institute', 'Plan', 'Amount', 'Period', 'Date', 'Txn ID', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide first:px-5">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody className="divide-y divide-gray-50">
                                    {metrics.recentPayments.map(b => <PaymentRow key={b.id} bill={b} />)}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* Failed Payments */}
                {activeTab === 'failed' && (
                    !metrics?.failedPayments?.length ? (
                        <div className="py-16 text-center">
                            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-300 mb-3" />
                            <p className="font-medium text-gray-500">No failed payments 🎉</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="bg-red-50 text-left">
                                    {['Institute', 'Plan', 'Amount', 'Period', 'Date', 'Txn ID', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold text-red-400 uppercase tracking-wide first:px-5">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody className="divide-y divide-gray-50">
                                    {metrics.failedPayments.map(b => <PaymentRow key={b.id} bill={b} />)}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* Upcoming Expirations */}
                {activeTab === 'expirations' && (
                    !metrics?.upcomingExpirations?.length ? (
                        <div className="py-16 text-center">
                            <Calendar className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                            <p className="font-medium text-gray-500">No institutes expiring in the next 30 days</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {metrics.upcomingExpirations.map(e => (
                                <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{e.name}</p>
                                            <p className="text-xs text-gray-400 capitalize">{e.plan} plan</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${e.daysLeft <= 0 ? 'text-red-600' : e.daysLeft <= 7 ? 'text-orange-500' : 'text-amber-600'}`}>
                                            {e.daysLeft <= 0 ? 'Expired' : `${e.daysLeft}d left`}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(e.subscription_ends_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Manual Payment Modal */}
            <AnimatePresence>
                {showModal && <ManualPaymentModal onClose={() => setShowModal(false)} />}
            </AnimatePresence>
        </div>
    );
};
