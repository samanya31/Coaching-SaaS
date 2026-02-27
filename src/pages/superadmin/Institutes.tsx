import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Users, Calendar, Globe, Crown,
    ShieldOff, ShieldCheck, RefreshCw, Eye, UserCog,
    Search, Filter, MoreVertical, CheckCircle2, Clock,
    XCircle, AlertTriangle, ArrowUpRight, Loader2,
} from 'lucide-react';
import { useInstitutes, useUpdateInstituteStatus, Institute } from '@/hooks/data/useInstitutes';
import { useSaasPlans } from '@/hooks/data/useSaasPlans';
import { supabase } from '@/config/supabase';
import { useQueryClient } from '@tanstack/react-query';

// ── Helpers ──────────────────────────────────────────────────────────
const PLANS = ['free', 'starter', 'pro', 'enterprise'] as const;
const STATUSES = ['active', 'suspended', 'trial', 'expired'] as const;

const planBadge: Record<string, string> = {
    free: 'bg-gray-100 text-gray-600',
    starter: 'bg-blue-100 text-blue-700',
    pro: 'bg-indigo-100 text-indigo-700',
    enterprise: 'bg-purple-100 text-purple-800',
};

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    active: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Active' },
    trial: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Trial' },
    suspended: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Suspended' },
    expired: { color: 'bg-gray-100 text-gray-500', icon: AlertTriangle, label: 'Expired' },
};

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);

const daysLeft = (date: string | null) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
    return diff;
};

// ── Action Menu ───────────────────────────────────────────────────────
const ActionMenu = ({ inst }: { inst: Institute }) => {
    const [open, setOpen] = useState(false);
    const [assigningPlan, setAssigningPlan] = useState(false);
    const { mutate: updateStatus, isPending: statusPending } = useUpdateInstituteStatus();
    const { data: plans = [] } = useSaasPlans();
    const qc = useQueryClient();

    const toggleSuspend = () => {
        const next = inst.status === 'suspended' ? 'active' : 'suspended';
        updateStatus({ id: inst.id, status: next });
        setOpen(false);
    };

    const assignPlan = async (planId: string) => {
        setAssigningPlan(true);
        await supabase.from('coachings').update({ plan_id: planId }).eq('id', inst.id);
        qc.invalidateQueries({ queryKey: ['superadmin-institutes'] });
        setAssigningPlan(false);
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
                {(statusPending || assigningPlan)
                    ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    : <MoreVertical className="w-4 h-4 text-gray-500" />
                }
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-gray-100 w-52 py-1.5 overflow-hidden"
                        >
                            {/* Assign Plan from DB */}
                            <div className="px-3 pt-1 pb-1">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Assign Plan</p>
                                <div className="flex flex-wrap gap-1">
                                    {plans.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => assignPlan(p.id)}
                                            className={`text-[11px] px-2 py-0.5 rounded-full capitalize font-medium border transition-all ${inst.plan_id === p.id
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                                                }`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                    {plans.length === 0 && (
                                        <span className="text-[11px] text-gray-400">Run migration 015_saas_plans.sql</span>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 mx-3 my-1.5" />

                            {/* Suspend / Activate */}
                            <button
                                onClick={toggleSuspend}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${inst.status === 'suspended' ? 'text-emerald-600' : 'text-red-600'}`}
                            >
                                {inst.status === 'suspended'
                                    ? <><ShieldCheck className="w-4 h-4" /> Activate Institute</>
                                    : <><ShieldOff className="w-4 h-4" /> Suspend Institute</>
                                }
                            </button>

                            {/* Reset Password */}
                            <button
                                onClick={() => { alert('Password reset email would be sent to: ' + inst.owner_email); setOpen(false); }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 text-gray-400" />
                                Reset Owner Password
                            </button>

                            {/* View Usage */}
                            <button
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Eye className="w-4 h-4 text-gray-400" />
                                View Usage
                            </button>

                            {/* Impersonate */}
                            <div className="h-px bg-gray-100 mx-3 my-1.5" />
                            <button
                                onClick={() => {
                                    if (confirm(`⚠️ Impersonate ${inst.name}? This will log you in as their admin.`)) {
                                        alert('Impersonation requires Supabase Edge Function — coming soon.');
                                    }
                                    setOpen(false);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                                <UserCog className="w-4 h-4" />
                                Impersonate Admin
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Institute Card ────────────────────────────────────────────────────
const InstituteCard = ({ inst, index }: { inst: Institute; index: number }) => {
    const sc = statusConfig[inst.status] || statusConfig.active;
    const StatusIcon = sc.icon;
    const expiry = daysLeft(inst.subscription_ends_at);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {inst.logo_url
                        ? <img src={inst.logo_url} alt={inst.name} className="w-10 h-10 rounded-xl object-cover" />
                        : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                {inst.name.charAt(0).toUpperCase()}
                            </div>
                        )
                    }
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{inst.name}</h3>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3" />
                            {inst.subdomain ? `${inst.subdomain}.examedge.in` : inst.slug}
                        </p>
                    </div>
                </div>
                <ActionMenu inst={inst} />
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {sc.label}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${planBadge[inst.plan] || planBadge.free}`}>
                    <Crown className="w-2.5 h-2.5 inline mr-0.5" />
                    {inst.plan}
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">Students</p>
                    <p className="text-base font-bold text-gray-800 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        {fmt(inst.student_count)}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 font-medium uppercase mb-0.5">Expires</p>
                    <p className={`text-base font-bold flex items-center gap-1 ${expiry !== null && expiry < 7 ? 'text-red-600' : 'text-gray-800'}`}>
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {expiry === null ? '—' : expiry <= 0 ? 'Expired' : `${expiry}d`}
                    </p>
                </div>
            </div>

            {/* Owner */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">Owner</p>
                    <p className="text-xs text-gray-700 font-medium truncate">{inst.owner_name || 'Not set'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{inst.owner_email || '—'}</p>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition-colors flex-shrink-0 ml-2">
                    Details <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────
export const SuperAdminInstitutes = () => {
    const { data: institutes = [], isLoading, error } = useInstitutes();
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPlan, setFilterPlan] = useState('all');

    const filtered = institutes.filter(inst => {
        const matchSearch = !search ||
            inst.name.toLowerCase().includes(search.toLowerCase()) ||
            inst.slug.toLowerCase().includes(search.toLowerCase()) ||
            (inst.owner_name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || inst.status === filterStatus;
        const matchPlan = filterPlan === 'all' || inst.plan === filterPlan;
        return matchSearch && matchStatus && matchPlan;
    });

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Institutes</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {institutes.length} total · {institutes.filter(i => i.status === 'active').length} active
                    </p>
                </div>
                <button
                    onClick={() => qc.invalidateQueries({ queryKey: ['superadmin-institutes'] })}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATUSES.map(s => {
                    const sc = statusConfig[s];
                    const Icon = sc.icon;
                    const count = institutes.filter(i => i.status === s).length;
                    return (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {sc.label} <span className="ml-auto font-bold">{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, slug, or owner..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <select
                        value={filterPlan}
                        onChange={e => setFilterPlan(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                        <option value="all">All Plans</option>
                        {PLANS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    Failed to load institutes. Check RLS policies for superadmin.
                </div>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
                            <div className="flex gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="h-3 bg-gray-100 rounded mb-3" />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="h-12 bg-gray-100 rounded-xl" />
                                <div className="h-12 bg-gray-100 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                    <Building2 className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium text-gray-500">
                        {institutes.length === 0 ? 'No institutes registered yet' : 'No institutes match your filters'}
                    </p>
                    {institutes.length === 0 && (
                        <p className="text-sm text-gray-400 mt-1">Institutes will appear here when coaches sign up.</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((inst, i) => (
                        <InstituteCard key={inst.id} inst={inst} index={i} />
                    ))}
                </div>
            )}

            {/* Footer count */}
            {filtered.length > 0 && !isLoading && (
                <p className="text-xs text-gray-400 text-center">
                    Showing {filtered.length} of {institutes.length} institutes
                </p>
            )}
        </div>
    );
};
