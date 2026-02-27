import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HardDrive, AlertTriangle, FileX, RefreshCw,
    Search, Trash2, ArrowUpRight, Database,
    Film, FileText, Image, Package, Clock, TrendingUp,
    CheckCircle2, Building2,
} from 'lucide-react';
import { useStorageStats, fmtSize, StoragePerCoaching } from '@/hooks/data/useStorageStats';
import { useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ── Helpers ──────────────────────────────────────────────────────────
const BUCKET_COLORS: Record<string, string> = {
    media: '#6366F1',
    documents: '#F59E0B',
    avatars: '#10B981',
    other: '#94A3B8',
};

const BUCKET_ICONS: Record<string, any> = {
    media: Film,
    documents: FileText,
    avatars: Image,
};

const planColor: Record<string, string> = {
    basic: 'bg-slate-100 text-slate-700',
    pro: 'bg-indigo-100 text-indigo-700',
    advanced: 'bg-purple-100 text-purple-800',
    free: 'bg-gray-100 text-gray-500',
};

// ── Storage Bar ───────────────────────────────────────────────────────
const StorageBar = ({ pct, bytes, limitGb }: { pct: number; bytes: number; limitGb: number }) => {
    const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-indigo-500';
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>{fmtSize(bytes)}</span>
                <span>{limitGb} GB limit</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                />
            </div>
            <p className={`text-[10px] mt-0.5 font-medium ${pct >= 90 ? 'text-red-500' : 'text-gray-400'}`}>
                {pct.toFixed(1)}% used
            </p>
        </div>
    );
};

// ── KPI Card ─────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, iconBg, label, value, sub, index }: {
    icon: any; iconBg: string; label: string; value: string; sub?: string; index: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
    >
        <div className={`inline-flex p-2.5 rounded-xl mb-3 ${iconBg}`}>
            <Icon className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
);

// ── Institute Row ─────────────────────────────────────────────────────
const InstituteRow = ({ inst, rank }: { inst: StoragePerCoaching; rank: number }) => (
    <tr className="hover:bg-gray-50 transition-colors group">
        <td className="px-5 py-3 text-sm font-bold text-gray-400 w-8">#{rank}</td>
        <td className="px-4 py-3">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-800">{inst.coaching_name}</p>
                    <p className="text-[10px] text-gray-400">{inst.slug}</p>
                </div>
            </div>
        </td>
        <td className="px-4 py-3">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${planColor[inst.plan] || planColor.free}`}>
                {inst.plan}
            </span>
        </td>
        <td className="px-4 py-3 min-w-[160px]">
            <StorageBar pct={inst.used_pct} bytes={inst.total_bytes} limitGb={inst.plan_limit_gb} />
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-700">{fmtSize(inst.total_bytes)}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{inst.total_files.toLocaleString()}</td>
        <td className="px-4 py-3">
            {inst.orphan_files > 0 ? (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit">
                    <FileX className="w-3 h-3" /> {inst.orphan_files} orphans
                </span>
            ) : (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> Clean
                </span>
            )}
        </td>
        <td className="px-4 py-3 text-[11px] text-gray-400">
            {inst.last_upload_at
                ? new Date(inst.last_upload_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—'
            }
        </td>
    </tr>
);

// ── Roadmap Card ──────────────────────────────────────────────────────
const RoadmapItem = ({ icon: Icon, title, desc, tag }: { icon: any; title: string; desc: string; tag: string }) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
            <Icon className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tag === 'Soon' ? 'bg-amber-100 text-amber-700' :
                        tag === 'Planned' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>{tag}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">{desc}</p>
        </div>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────
export const SuperAdminStorage = () => {
    const { data, isLoading, error } = useStorageStats();
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'top10' | 'all' | 'roadmap'>('top10');

    const filtered = (data?.all || []).filter(i =>
        !search || i.coaching_name.toLowerCase().includes(search.toLowerCase())
    );

    const pieData = (data?.bucketBreakdown || []).map(b => ({
        name: b.bucket,
        value: b.bytes,
        files: b.files,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Storage Monitor</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Platform-wide file storage across all institutes
                    </p>
                </div>
                <button
                    onClick={() => qc.invalidateQueries({ queryKey: ['superadmin-storage'] })}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm"
                >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
            </div>

            {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Run <code className="bg-amber-100 px-1 rounded">016_storage_tracking.sql</code> first to create the storage tracking table.
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                            <div className="h-8 w-8 bg-gray-200 rounded-xl mb-3" />
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                            <div className="h-6 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))
                    : [
                        {
                            icon: HardDrive, iconBg: 'bg-indigo-100 text-indigo-600',
                            label: 'Total Storage Used', value: fmtSize(data?.totalBytes || 0),
                            sub: `across ${data?.all.length || 0} institutes`,
                        },
                        {
                            icon: Package, iconBg: 'bg-blue-100 text-blue-600',
                            label: 'Total Files', value: (data?.totalFiles || 0).toLocaleString(),
                            sub: 'all buckets combined',
                        },
                        {
                            icon: FileX, iconBg: 'bg-red-100 text-red-600',
                            label: 'Orphan Files', value: (data?.totalOrphans || 0).toLocaleString(),
                            sub: 'unreferenced, safe to delete',
                        },
                        {
                            icon: AlertTriangle, iconBg: 'bg-amber-100 text-amber-600',
                            label: 'Over 80% Quota', value: (data?.all.filter(i => i.used_pct >= 80).length || 0).toString(),
                            sub: 'institutes near limit',
                        },
                    ].map((k, i) => <KpiCard key={k.label} {...k} index={i} />)
                }
            </div>

            {/* Bucket Breakdown + Supabase Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-800 mb-1">Storage by Bucket</h2>
                    <p className="text-xs text-gray-400 mb-4">Breakdown of files by storage bucket type</p>
                    {isLoading ? (
                        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                    ) : pieData.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
                            No storage data yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70}
                                    dataKey="value" nameKey="name" paddingAngle={2}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={entry.name} fill={BUCKET_COLORS[entry.name] || '#94A3B8'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => fmtSize(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}

                    {/* Bucket list */}
                    <div className="space-y-2 mt-2">
                        {(data?.bucketBreakdown || []).map(b => {
                            const Icon = BUCKET_ICONS[b.bucket] || Package;
                            return (
                                <div key={b.bucket} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div style={{ backgroundColor: BUCKET_COLORS[b.bucket] || '#94A3B8' }}
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-sm text-gray-700 capitalize">{b.bucket}</span>
                                        <span className="text-xs text-gray-400">({b.files} files)</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800">{fmtSize(b.bytes)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Supabase Storage Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-800 mb-1">Storage Sources</h2>
                    <p className="text-xs text-gray-400 mb-4">How files are stored on this platform</p>
                    <div className="space-y-3">
                        {[
                            {
                                name: 'Supabase Storage', icon: Database,
                                color: 'bg-emerald-100 text-emerald-700',
                                desc: 'Avatars, thumbnails, PDFs, announcement banners',
                                status: 'Active',
                                statusColor: 'text-emerald-600',
                            },
                            {
                                name: 'Cloudflare R2', icon: Film,
                                color: 'bg-orange-100 text-orange-700',
                                desc: 'Video lectures, large course content',
                                status: 'External — track via API',
                                statusColor: 'text-orange-500',
                            },
                        ].map(s => (
                            <div key={s.name} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
                                <div className={`p-2 rounded-lg ${s.color} flex-shrink-0`}>
                                    <s.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                                    <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{s.desc}</p>
                                    <p className={`text-[11px] font-medium mt-1 ${s.statusColor}`}>{s.status}</p>
                                </div>
                            </div>
                        ))}

                        <div className="bg-indigo-50 rounded-xl p-3.5">
                            <p className="text-xs font-semibold text-indigo-800 mb-1">💡 R2 Integration</p>
                            <p className="text-[11px] text-indigo-700 leading-snug">
                                To track R2 usage per institute, log file metadata to{' '}
                                <code className="bg-indigo-100 px-1 rounded">storage_usage</code> table
                                when files are uploaded via your R2 uploader. The Storage Monitor will
                                automatically aggregate it.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Institute Table with Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Tab Bar */}
                <div className="flex border-b border-gray-100 items-center justify-between pr-4">
                    <div className="flex">
                        {([
                            { key: 'top10', label: '🔥 Top 10 Heavy' },
                            { key: 'all', label: 'All Institutes' },
                            { key: 'roadmap', label: '🔮 Roadmap' },
                        ] as const).map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t.key
                                        ? 'border-indigo-600 text-indigo-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    {activeTab === 'all' && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            />
                        </div>
                    )}
                </div>

                {/* Top 10 */}
                {activeTab === 'top10' && (
                    isLoading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
                        </div>
                    ) : !data?.top10.length ? (
                        <div className="py-16 text-center text-gray-400">
                            <HardDrive className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                            <p className="font-medium text-gray-500">No storage data yet</p>
                            <p className="text-sm mt-1">Files will appear here once institutes start uploading.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        {['#', 'Institute', 'Plan', 'Usage', 'Size', 'Files', 'Orphans', 'Last Upload'].map(h => (
                                            <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide first:px-5">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.top10.map((inst, i) => (
                                        <InstituteRow key={inst.coaching_id} inst={inst} rank={i + 1} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* All Institutes */}
                {activeTab === 'all' && (
                    filtered.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">No institutes match your search.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        {['#', 'Institute', 'Plan', 'Usage', 'Size', 'Files', 'Orphans', 'Last Upload'].map(h => (
                                            <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide first:px-5">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((inst, i) => (
                                        <InstituteRow key={inst.coaching_id} inst={inst} rank={i + 1} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* Roadmap */}
                {activeTab === 'roadmap' && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RoadmapItem
                            icon={FileX}
                            title="Orphan File Detection"
                            desc="Automatically flag files in storage that are no longer referenced by any course or resource."
                            tag="Soon"
                        />
                        <RoadmapItem
                            icon={Trash2}
                            title="Bulk Delete by Institute"
                            desc="Select an institute and delete all their files at once when they churn or expire."
                            tag="Soon"
                        />
                        <RoadmapItem
                            icon={TrendingUp}
                            title="Storage Growth Trend"
                            desc="Month-over-month storage growth chart per institute to predict when they'll hit their quota."
                            tag="Planned"
                        />
                        <RoadmapItem
                            icon={Film}
                            title="File Type Breakdown"
                            desc="Pie chart of videos vs PDFs vs images vs other per institute for targeted cleanup."
                            tag="Planned"
                        />
                        <RoadmapItem
                            icon={Clock}
                            title="Stale File Detection"
                            desc="Flag files not accessed in 90+ days — potential candidates for archival or deletion."
                            tag="Planned"
                        />
                        <RoadmapItem
                            icon={AlertTriangle}
                            title="Quota Enforcement Alerts"
                            desc="Email the coaching admin when they cross 80% and block uploads at 100%."
                            tag="Planned"
                        />
                        <RoadmapItem
                            icon={Database}
                            title="R2 API Integration"
                            desc="Pull live Cloudflare R2 bucket stats via Workers API to show real bandwidth and object counts."
                            tag="Future"
                        />
                        <RoadmapItem
                            icon={Package}
                            title="Duplicate File Detection"
                            desc="Hash-based deduplication to find identical files stored multiple times across institutes."
                            tag="Future"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
