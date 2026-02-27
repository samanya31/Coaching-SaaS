import { useState } from 'react';
import { useStorageSummary, useRecentUploads, formatBytes, useCategoryLabel, MediaFile } from '@/hooks/data/useStorage';
import {
    HardDrive, FileVideo, FileImage, FileText, RefreshCw,
    Layers, ChevronDown, ChevronRight, Trash2, ExternalLink,
    Film, Image, File, User, Tag, Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import r2 from '@/services/r2.service';
import { toast } from 'sonner';

// ── Per-category icon ──────────────────────────────────────────────
const CAT_ICON: Record<string, any> = {
    videos: Film,
    thumbnails: Image,
    materials: FileText,
    logos: Tag,
    avatars: User,
};

const CAT_COLOR: Record<string, string> = {
    videos: 'text-indigo-500 bg-indigo-50',
    thumbnails: 'text-purple-500 bg-purple-50',
    materials: 'text-orange-500 bg-orange-50',
    logos: 'text-yellow-600 bg-yellow-50',
    avatars: 'text-emerald-600 bg-emerald-50',
};

const BAR_COLOR: Record<string, string> = {
    videos: 'bg-indigo-500',
    thumbnails: 'bg-purple-500',
    materials: 'bg-orange-400',
    logos: 'bg-yellow-400',
    avatars: 'bg-emerald-500',
};

// ── File Row ───────────────────────────────────────────────────────
const FileRow = ({ file, onDelete }: { file: MediaFile; onDelete: (f: MediaFile) => void }) => {
    const Icon = CAT_ICON[file.category] ?? File;
    const iconCls = CAT_COLOR[file.category] ?? 'text-gray-500 bg-gray-100';
    return (
        <tr className="hover:bg-gray-50 transition-colors group">
            <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${iconCls}`}>
                        <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                        className="text-sm font-medium text-gray-700 truncate max-w-[220px]"
                        title={file.file_name}
                    >
                        {file.file_name}
                    </span>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500 tabular-nums whitespace-nowrap">
                {formatBytes(file.file_size)}
            </td>
            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                {new Date(file.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                })}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                        href={file.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                        title="Open file"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                        onClick={() => onDelete(file)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600"
                        title="Delete file"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ── Main Page ──────────────────────────────────────────────────────
export const StorageSettings = () => {
    const { coachingId } = useTenant();
    const qc = useQueryClient();
    const { data: summary = [], isLoading: loadingSummary, refetch: refetchSummary } = useStorageSummary();
    const { data: allFiles = [], isLoading: loadingFiles, refetch: refetchFiles } = useRecentUploads(500); // get all

    const [expanded, setExpanded] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const totalBytes = summary.reduce((acc, row) => acc + (Number(row.total_bytes) || 0), 0);
    const totalFiles = summary.reduce((acc, row) => acc + (Number(row.file_count) || 0), 0);

    const handleRefresh = () => {
        refetchSummary();
        refetchFiles();
    };

    const handleDeleteFile = async (file: MediaFile) => {
        if (!confirm(`Delete "${file.file_name}"?\n\nThis will permanently remove the file from R2 storage.`)) return;
        setDeletingId(file.id);
        try {
            await r2.remove(file.public_url);
            toast.success(`"${file.file_name}" deleted from storage.`);
            refetchSummary();
            refetchFiles();
            qc.invalidateQueries({ queryKey: ['superadmin-storage'] });
        } catch (err: any) {
            toast.error('Delete failed: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loadingSummary || loadingFiles) {
        return (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    const categories = ['videos', 'thumbnails', 'materials', 'logos', 'avatars'];

    return (
        <div className="p-6 space-y-8 max-w-5xl">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-xl text-white">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-indigo-600">Total Storage Used</p>
                            <p className="text-2xl font-bold text-gray-900">{formatBytes(totalBytes)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 p-3 rounded-xl text-white">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Total Files</p>
                            <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Data Status</p>
                        <p className="text-sm text-gray-500 mt-1">Real-time tracking enabled</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        title="Refresh Stats"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Category Breakdown — Click to expand */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Storage Breakdown</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Click any category to see individual files</p>
                </div>

                <div className="divide-y divide-gray-50">
                    {categories.map(cat => {
                        const row = summary.find(s => s.category === cat);
                        const mb = row ? Number(row.total_mb) : 0;
                        const count = row ? Number(row.file_count) : 0;
                        const bytes = row ? Number(row.total_bytes) : 0;
                        const pct = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0;
                        const isOpen = expanded === cat;
                        const catFiles = allFiles.filter(f => f.category === cat);
                        const Icon = CAT_ICON[cat] ?? File;
                        const colors = CAT_COLOR[cat] ?? 'text-gray-500 bg-gray-100';
                        const barColor = BAR_COLOR[cat] ?? 'bg-gray-400';

                        return (
                            <div key={cat}>
                                {/* Category Header Row */}
                                <button
                                    onClick={() => setExpanded(isOpen ? null : cat)}
                                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className={`p-2 rounded-lg ${colors}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800 text-sm">
                                                    {useCategoryLabel(cat)}
                                                </span>
                                                <span className="text-xs text-gray-400">({count} files)</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 tabular-nums">
                                                {mb.toFixed(1)} MB
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                    {count > 0 && (
                                        <div className="flex-shrink-0 text-gray-400">
                                            {isOpen
                                                ? <ChevronDown className="w-4 h-4" />
                                                : <ChevronRight className="w-4 h-4" />
                                            }
                                        </div>
                                    )}
                                </button>

                                {/* Expanded File List */}
                                {isOpen && count > 0 && (
                                    <div className="border-t border-gray-100">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 text-left">
                                                    <th className="px-5 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">File Name</th>
                                                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Size</th>
                                                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Uploaded</th>
                                                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {catFiles.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="px-5 py-6 text-sm text-gray-400 text-center italic">
                                                            No files in this category yet
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    catFiles.map(file => (
                                                        deletingId === file.id ? (
                                                            <tr key={file.id} className="bg-red-50">
                                                                <td colSpan={4} className="px-5 py-3 text-sm text-red-500 flex items-center gap-2">
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    Deleting {file.file_name}...
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            <FileRow key={file.id} file={file} onDelete={handleDeleteFile} />
                                                        )
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
