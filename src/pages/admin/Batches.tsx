import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, BookOpen, Edit2, Eye, Trash2, FileDown, Link as LinkIcon, ExternalLink, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBatches, useDeleteBatch } from '@/hooks/data/useBatches';
import { useCreateStudyMaterial } from '@/hooks/data/useStudyMaterials';
import { useTenant } from '@/app/providers/TenantProvider';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import r2 from '@/services/r2.service';
import { useCallback, useRef } from 'react';

export const Batches = () => {
    // Fetch data from database
    const { data: batches = [], isLoading } = useBatches();
    const deleteBatch = useDeleteBatch();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Study Materials modal state
    const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
    const [materialForm, setMaterialForm] = useState({ batch_id: '', title: '', description: '', file_url: '', is_public: false });
    const { mutate: createMaterial, isPending: isCreatingMaterial } = useCreateStudyMaterial();
    const { coachingId } = useTenant();
    const { user } = useAuth();

    // ── Upload state
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'video/mp4'
        ];

        // For study materials, we are more flexible, but primarily PDFs
        setSelectedFile(file);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, []);

    // Handle study material form submission
    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!materialForm.is_public && !materialForm.batch_id) {
            toast.error("Please select a batch");
            return;
        }
        if (!materialForm.title) {
            toast.error("Title is required");
            return;
        }

        if (uploadMode === 'file' && !selectedFile) {
            toast.error("Please select a file to upload");
            return;
        }

        if (uploadMode === 'url' && !materialForm.file_url) {
            toast.error("File URL is required");
            return;
        }

        // Try to get coaching_id from selected batch, or fall back to first batch's coaching_id
        let finalCoachingId = coachingId;
        if (!finalCoachingId) {
            if (materialForm.batch_id) {
                const selectedBatch = batches.find(b => b.id === materialForm.batch_id);
                if (selectedBatch) finalCoachingId = selectedBatch.coaching_id;
            } else if (batches.length > 0) {
                finalCoachingId = batches[0].coaching_id;
            }
        }

        if (!finalCoachingId) {
            toast.error("Could not determine Coaching ID. Please create a batch first.");
            return;
        }

        try {
            let fileUrl = materialForm.file_url;

            if (uploadMode === 'file' && selectedFile) {
                setIsUploading(true);
                const progressInterval = setInterval(() => {
                    setUploadProgress(p => Math.min(p + 10, 90));
                }, 300);

                try {
                    fileUrl = await r2.upload(finalCoachingId, 'materials', selectedFile, {
                        subFolder: materialForm.batch_id || 'general',
                        entityType: 'study_material',
                        uploadedBy: user?.id
                    });
                    setUploadProgress(100);
                } finally {
                    clearInterval(progressInterval);
                    setIsUploading(false);
                }
            }

            createMaterial({
                batch_id: materialForm.batch_id,
                coaching_id: finalCoachingId,
                title: materialForm.title,
                description: materialForm.description,
                file_url: fileUrl,
                is_public: materialForm.is_public
            }, {
                onSuccess: () => {
                    setIsAddMaterialOpen(false);
                    setMaterialForm({ batch_id: '', title: '', description: '', file_url: '', is_public: false });
                    setSelectedFile(null);
                    setUploadProgress(0);
                    setUploadMode('file');
                    toast.success("Material added successfully!");
                }
            });
        } catch (error: any) {
            console.error('Failed to add material:', error);
            toast.error(error.message || "Failed to add material");
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading batches...</p>
                </div>
            </div>
        );
    }

    // Filter batches
    const filteredBatches = batches.filter(batch => {
        const matchesSearch = (batch.title || batch.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (batch.instructor || ((batch.metadata as any)?.instructor || '')).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBatches = filteredBatches.slice(startIndex, startIndex + itemsPerPage);

    const formatPrice = (price: number) => {
        return `₹${(price || 0).toLocaleString('en-IN')}`;
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete batch "${name}"? This action cannot be undone.`)) {
            await deleteBatch.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
                    <p className="text-gray-600 mt-1">Manage all courses and batches</p>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
                    <p className="text-gray-600 mt-1">Manage all courses and batches</p>
                </div>
            </div>

            {/* Dashboard Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

                {/* 1. Total Batches Stat */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Batches</p>
                        <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
                    </div>
                </div>

                {/* 2. Create Batch Action */}
                <Link to="/admin/dashboard/batches/new" className="block group">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 shadow-sm border border-transparent text-white hover:shadow-md transition-all h-full flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-lg font-bold">Create Batch</p>
                            <p className="text-xs text-indigo-100 mt-0.5">Start a new cohort</p>
                        </div>
                    </div>
                </Link>

                {/* 3. Add Video Action */}
                <Link to="/admin/dashboard/content/new" className="block group">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all h-full flex items-center gap-4 group-hover:bg-indigo-50/50">
                        <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-900">Add Video</p>
                            <p className="text-xs text-gray-500 mt-0.5">Upload new content</p>
                        </div>
                    </div>
                </Link>

                {/* 4. Add Live Class Action */}
                <Link to="/admin/dashboard/live-classes/new" className="block group">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all h-full flex items-center gap-4 group-hover:bg-purple-50/50">
                        <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <Eye className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-900">Schedule Class</p>
                            <p className="text-xs text-gray-500 mt-0.5">Start live session</p>
                        </div>
                    </div>
                </Link>

                {/* 5. Add Study Material Action */}
                <button
                    onClick={() => setIsAddMaterialOpen(true)}
                    className="block group w-full text-left"
                >
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all h-full flex items-center gap-4 group-hover:bg-emerald-50/50">
                        <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                            <FileDown className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-gray-900">Study Materials</p>
                            <p className="text-xs text-gray-500 mt-0.5">Select a batch below</p>
                        </div>
                    </div>
                </button>

            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search batches, instructors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Batches Table - Main View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-batch-list>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Instructor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Students</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedBatches.length > 0 ? (
                                paginatedBatches.map((batch) => (
                                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {(batch.thumbnail || batch.thumbnail_url) ? (
                                                        <img
                                                            src={batch.thumbnail || batch.thumbnail_url}
                                                            alt={batch.title || batch.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=Batch';
                                                                (e.target as HTMLImageElement).onerror = null; // Prevent infinite loop
                                                            }}
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 line-clamp-1">{batch.title || batch.name}</p>
                                                    <p className="text-xs text-indigo-600 font-medium">{formatPrice(batch.price || batch.fee_amount)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{batch.instructor || (batch.metadata as any)?.instructor || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{batch.start_date ? new Date(batch.start_date).toLocaleDateString() : '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{batch.end_date ? new Date(batch.end_date).toLocaleDateString() : '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {(batch.students || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {batch.status === 'active' ? 'Active' : 'Completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/dashboard/batches/${batch.id}`}>
                                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-indigo-600">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link to={`/admin/dashboard/batches/${batch.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-indigo-600">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-500 hover:text-red-600"
                                                    onClick={() => handleDelete(batch.id, batch.title || batch.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No batches found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Add Study Material Modal */}
            {isAddMaterialOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAddMaterialOpen(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add Study Material</h3>
                        <form onSubmit={handleAddMaterial} className="space-y-4">

                            {/* Current Affairs Toggle */}
                            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <input
                                    type="checkbox"
                                    id="is_public"
                                    checked={materialForm.is_public}
                                    onChange={(e) => setMaterialForm({ ...materialForm, is_public: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                />
                                <label htmlFor="is_public" className="text-sm font-medium text-amber-900 cursor-pointer select-none">
                                    Mark as Current Affairs (Visible to All)
                                </label>
                            </div>

                            {/* Batch Selector - Disabled if Public */}
                            <div className={materialForm.is_public ? 'opacity-50 pointer-events-none' : ''}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch {materialForm.is_public ? '(Optional)' : '*'}</label>
                                <select
                                    required={!materialForm.is_public}
                                    value={materialForm.batch_id}
                                    onChange={(e) => setMaterialForm({ ...materialForm, batch_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.name} ({batch.exam_goal})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    required
                                    type="text"
                                    value={materialForm.title}
                                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    placeholder="e.g., Chapter 5 Notes PDF"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={materialForm.description}
                                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    placeholder="Optional description"
                                    rows={2}
                                />
                            </div>

                            {/* Upload Source Toggle */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">File Source *</label>
                                <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                                    <button
                                        type="button"
                                        onClick={() => { setUploadMode('file'); setSelectedFile(null); }}
                                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${uploadMode === 'file' ? 'bg-white shadow text-emerald-600' : 'text-gray-600'}`}
                                    >
                                        <Upload className="w-3.5 h-3.5" /> Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setUploadMode('url'); setSelectedFile(null); }}
                                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${uploadMode === 'url' ? 'bg-white shadow text-emerald-600' : 'text-gray-600'}`}
                                    >
                                        <LinkIcon className="w-3.5 h-3.5" /> Direct URL
                                    </button>
                                </div>

                                {uploadMode === 'file' ? (
                                    <div className="space-y-3">
                                        {!selectedFile ? (
                                            <div
                                                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                                onDragLeave={() => setIsDragging(false)}
                                                onDrop={onDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
                                                <p className="text-sm font-medium text-gray-700">Drag & drop your file</p>
                                                <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileSelect(file);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="p-2 bg-white rounded-md">
                                                        <FileDown className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-medium text-emerald-900 truncate">{selectedFile.name}</p>
                                                        <p className="text-xs text-emerald-600">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-emerald-700 hover:bg-emerald-100"
                                                    onClick={() => setSelectedFile(null)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {isUploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium text-emerald-700">
                                                    <span className="flex items-center gap-1.5">
                                                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                                                    </span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <LinkIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">File URL</span>
                                        </div>
                                        <input
                                            required
                                            type="url"
                                            value={materialForm.file_url}
                                            onChange={(e) => setMaterialForm({ ...materialForm, file_url: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                            placeholder="https://drive.google.com/file/... or R2 URL"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Paste the direct link to your PDF or document</p>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddMaterialOpen(false);
                                        setSelectedFile(null);
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreatingMaterial || isUploading}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {isCreatingMaterial || isUploading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Adding...
                                        </span>
                                    ) : 'Add Material'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
