import { useStorageSummary, useRecentUploads, formatBytes, useCategoryLabel } from '@/hooks/data/useStorage';
import { HardDrive, FileVideo, FileImage, FileText, RefreshCw, Layers } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const StorageSettings = () => {
    const { data: summary = [], isLoading: loadingSummary, refetch: refetchSummary } = useStorageSummary();
    const { data: recent = [], isLoading: loadingRecent, refetch: refetchRecent } = useRecentUploads(10);

    const totalBytes = summary.reduce((acc, row) => acc + (Number(row.total_bytes) || 0), 0);
    const totalFiles = summary.reduce((acc, row) => acc + (Number(row.file_count) || 0), 0);

    const handleRefresh = () => {
        refetchSummary();
        refetchRecent();
    };

    if (loadingSummary || loadingRecent) {
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

            {/* Category Breakdown */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Storage Breakdown</h3>
                <div className="space-y-6">
                    {categories.map(cat => {
                        const row = summary.find(s => s.category === cat);
                        const mb = row ? Number(row.total_mb) : 0;
                        const count = row ? Number(row.file_count) : 0;
                        const percentage = totalBytes > 0 ? (row ? (Number(row.total_bytes) / totalBytes) * 100 : 0) : 0;

                        return (
                            <div key={cat} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-800">{useCategoryLabel(cat)}</span>
                                        <span className="text-xs text-gray-400">({count} files)</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{mb.toFixed(1)} MB</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Uploads Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Recent Uploads</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                                <th className="px-6 py-4">File Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Size</th>
                                <th className="px-6 py-4">Upload Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recent.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                        No files uploaded yet
                                    </td>
                                </tr>
                            ) : (
                                recent.map(file => (
                                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {file.category === 'videos' ? <FileVideo className="w-4 h-4 text-indigo-500" /> :
                                                    file.category === 'materials' ? <FileText className="w-4 h-4 text-orange-500" /> :
                                                        <FileImage className="w-4 h-4 text-emerald-500" />}
                                                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={file.file_name}>
                                                    {file.file_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {useCategoryLabel(file.category)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 tabular-nums">
                                            {formatBytes(file.file_size)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
