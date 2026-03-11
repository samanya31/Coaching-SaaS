import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown, Users, HardDrive, Video, FileText,
    IndianRupee, Globe, Headphones, Plus, Pencil,
    Trash2, Star, Check, X, Loader2, AlertTriangle, ToggleLeft, ToggleRight,
    Image, Palette, BarChart3
} from 'lucide-react';
import { useSaasPlans, useUpsertSaasPlan, useDeleteSaasPlan, SaasPlan } from '@/hooks/data/useSaasPlans';

// ── helpers ──────────────────────────────────────────────────────────
const SUPPORT_LEVELS = ['community', 'email', 'priority', 'dedicated'];

const supportBadge: Record<string, string> = {
    community: 'bg-gray-100 text-gray-600',
    email: 'bg-blue-100 text-blue-700',
    priority: 'bg-indigo-100 text-indigo-700',
    dedicated: 'bg-purple-100 text-purple-800',
};

const planGradient: Record<string, string> = {
    basic: 'from-slate-600 to-slate-800',
    pro: 'from-indigo-600 to-purple-700',
    advanced: 'from-amber-500 to-orange-600',
};

const fmt = (n: number) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;

// ── Feature Row ───────────────────────────────────────────────────────
const FeatureRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Icon className="w-3.5 h-3.5 text-gray-400" />
            {label}
        </div>
        {typeof value === 'boolean' ? (
            value
                ? <Check className="w-4 h-4 text-emerald-500" />
                : <X className="w-4 h-4 text-gray-300" />
        ) : (
            <span className="text-sm font-semibold text-gray-800">{value}</span>
        )}
    </div>
);

// ── Plan Card ─────────────────────────────────────────────────────────
const PlanCard = ({
    plan, onEdit, onDelete,
}: {
    plan: SaasPlan;
    onEdit: (p: SaasPlan) => void;
    onDelete: (id: string) => void;
}) => {
    const gradient = planGradient[plan.slug] || 'from-gray-600 to-gray-800';
    const { mutate: deletePlan, isPending: deleting } = useDeleteSaasPlan();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-2xl overflow-hidden border shadow-sm ${plan.is_popular ? 'border-indigo-400 shadow-indigo-100' : 'border-gray-100'}`}
        >
            {/* Popular badge */}
            {plan.is_popular && (
                <div className="absolute top-3 right-12 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 z-10">
                    <Star className="w-2.5 h-2.5" /> POPULAR
                </div>
            )}

            {/* Header */}
            <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">Plan</p>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        {plan.description && (
                            <p className="text-white/70 text-xs mt-1 leading-snug">{plan.description}</p>
                        )}
                    </div>
                    <Crown className="w-6 h-6 text-white/60 flex-shrink-0 mt-1" />
                </div>

                <div className="mt-4 flex items-end gap-3">
                    <div>
                        <p className="text-[10px] text-white/60 uppercase mb-0.5">Monthly</p>
                        <p className="text-2xl font-black">{fmt(plan.price_monthly)}</p>
                    </div>
                    <div className="mb-0.5">
                        <p className="text-[10px] text-white/60 uppercase mb-0.5">Yearly</p>
                        <p className="text-base font-bold text-white/80">{fmt(plan.price_yearly)}</p>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="bg-white p-4">
                <FeatureRow icon={Users} label="Max Students" value={plan.max_students.toLocaleString()} />
                <FeatureRow icon={HardDrive} label="Storage" value={`${plan.max_storage_gb} GB`} />
                <FeatureRow icon={Video} label="Live Classes" value={plan.live_classes} />
                <FeatureRow icon={FileText} label="Tests & Exams" value={plan.tests_enabled} />
                <FeatureRow icon={Image} label="Banners Management" value={plan.banners_enabled} />
                <FeatureRow icon={Palette} label="Custom Branding" value={plan.branding_enabled} />
                <FeatureRow icon={BarChart3} label="Reports Management" value={plan.reports_enabled} />
                <FeatureRow icon={IndianRupee} label="Payment Collection" value={plan.payments_enabled} />
                <FeatureRow icon={Globe} label="Custom Domain" value={plan.custom_domain} />
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Headphones className="w-3.5 h-3.5 text-gray-400" />
                        Support
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${supportBadge[plan.support_level]}`}>
                        {plan.support_level}
                    </span>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between py-2 border-t border-gray-50 mt-1">
                    <span className="text-sm text-gray-500">Plan Active</span>
                    {plan.is_active
                        ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                        : <ToggleLeft className="w-6 h-6 text-gray-300" />
                    }
                </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-t border-gray-100">
                <button
                    onClick={() => onEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all"
                >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                    onClick={() => {
                        if (confirm(`Delete the "${plan.name}" plan? This cannot be undone.`)) {
                            deletePlan(plan.id);
                        }
                    }}
                    disabled={deleting}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
                >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
            </div>
        </motion.div>
    );
};

// ── Plan Form Modal ───────────────────────────────────────────────────
const DEFAULT_PLAN: Partial<SaasPlan> = {
    name: '', slug: '',
    price_monthly: 999, price_yearly: 9999,
    max_students: 100, max_storage_gb: 10,
    live_classes: false, tests_enabled: true,
    banners_enabled: false, branding_enabled: false,
    reports_enabled: false,
    payments_enabled: false, custom_domain: false,
    support_level: 'email',
    is_popular: false, is_active: true, sort_order: 99,
    description: '',
};

const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-700">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-indigo-600' : 'bg-gray-200'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
        </button>
    </div>
);

const PlanModal = ({
    plan, onClose,
}: {
    plan: Partial<SaasPlan> & { id?: string };
    onClose: () => void;
}) => {
    const [form, setForm] = useState<Partial<SaasPlan>>(plan);
    const { mutate: upsert, isPending, error } = useUpsertSaasPlan();

    const set = (k: keyof SaasPlan, v: any) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Auto-generate slug from name if not set
        const slug = form.slug || form.name?.toLowerCase().replace(/\s+/g, '-') || '';
        upsert({ ...form, slug }, { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-900">
                        {plan.id ? `Edit Plan: ${plan.name}` : 'Create New Plan'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name + Slug */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Plan Name</label>
                            <input value={form.name || ''} onChange={e => set('name', e.target.value)} required
                                placeholder="Pro"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Slug</label>
                            <input value={form.slug || ''} onChange={e => set('slug', e.target.value)}
                                placeholder="pro (auto-generated)"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Description</label>
                        <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Monthly Price (₹)</label>
                            <input type="number" value={form.price_monthly ?? 0} onChange={e => set('price_monthly', +e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Yearly Price (₹)</label>
                            <input type="number" value={form.price_yearly ?? 0} onChange={e => set('price_yearly', +e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Max Students</label>
                            <input type="number" value={form.max_students ?? 50} onChange={e => set('max_students', +e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Storage (GB)</label>
                            <input type="number" value={form.max_storage_gb ?? 5} onChange={e => set('max_storage_gb', +e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-0.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Feature Flags</p>
                        <Toggle label="Live Classes" value={!!form.live_classes} onChange={v => set('live_classes', v)} />
                        <Toggle label="Tests & Exams" value={!!form.tests_enabled} onChange={v => set('tests_enabled', v)} />
                        <Toggle label="Banners Management" value={!!form.banners_enabled} onChange={v => set('banners_enabled', v)} />
                        <Toggle label="Custom Branding" value={!!form.branding_enabled} onChange={v => set('branding_enabled', v)} />
                        <Toggle label="Reports Management" value={!!form.reports_enabled} onChange={v => set('reports_enabled', v)} />
                        <Toggle label="Payment Collection" value={!!form.payments_enabled} onChange={v => set('payments_enabled', v)} />
                        <Toggle label="Custom Domain" value={!!form.custom_domain} onChange={v => set('custom_domain', v)} />
                        <Toggle label="Popular Badge" value={!!form.is_popular} onChange={v => set('is_popular', v)} />
                        <Toggle label="Plan Active" value={!!form.is_active} onChange={v => set('is_active', v)} />
                    </div>

                    {/* Support Level */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Support Level</label>
                        <select value={form.support_level || 'email'} onChange={e => set('support_level', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                            {SUPPORT_LEVELS.map(s => (
                                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Sort Order</label>
                        <input type="number" value={form.sort_order ?? 99} onChange={e => set('sort_order', +e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {(error as Error).message}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending}
                            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : (plan.id ? 'Save Changes' : 'Create Plan')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────
export const SuperAdminPlans = () => {
    const { data: plans = [], isLoading } = useSaasPlans();
    const [editPlan, setEditPlan] = useState<(Partial<SaasPlan> & { id?: string }) | null>(null);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {plans.length} plan{plans.length !== 1 ? 's' : ''} · controls what institutes can access
                    </p>
                </div>
                <button
                    onClick={() => setEditPlan(DEFAULT_PLAN)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" /> New Plan
                </button>
            </div>

            {/* Info banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <span>
                    Plans are linked to institutes via <code className="bg-amber-100 px-1 rounded">coachings.plan_id</code>.
                    Changing a plan here updates feature limits globally for all institutes on that plan.
                </span>
            </div>

            {/* Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                            <div className="h-32 bg-gray-200" />
                            <div className="p-4 space-y-2">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <div key={j} className="h-3 bg-gray-100 rounded" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : plans.length === 0 ? (
                <div className="py-20 text-center">
                    <Crown className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium text-gray-500">No plans yet</p>
                    <p className="text-sm text-gray-400 mt-1">Run the SQL migration to seed Basic, Pro & Advanced plans.</p>
                    <button onClick={() => setEditPlan(DEFAULT_PLAN)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
                        Create First Plan
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans.map(plan => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onEdit={setEditPlan}
                            onDelete={(id) => {
                                if (confirm('Delete this plan?')) {
                                    // handled inside card
                                }
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {editPlan !== null && (
                    <PlanModal plan={editPlan} onClose={() => setEditPlan(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};
