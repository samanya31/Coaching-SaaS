import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Video, Link as LinkIcon, Upload, Calendar, GraduationCap, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCourse, useCreateCourse, useUpdateCourse, useCreateCourseContent } from '@/hooks/data/useCourses';
import { useBatches } from '@/hooks/data/useBatches';
import { useTenant } from '@/app/providers/TenantProvider';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import r2 from '@/services/r2.service';

const statuses = ['published', 'draft', 'archived'] as const;

const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(2)} GB`;
};

export const ContentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefilledBatchId = searchParams.get('batchId');
    const isEdit = !!id;
    const { coachingId } = useTenant();
    const { user } = useAuth();

    const { data: existingCourse, isLoading } = useCourse(id);
    const { data: batches = [] } = useBatches();
    const createCourse = useCreateCourse();
    const updateCourse = useUpdateCourse();
    const createContent = useCreateCourseContent();

    const [formData, setFormData] = useState({
        title: '',
        media_url: '',
        date: new Date().toISOString().split('T')[0],
        batch_id: prefilledBatchId || '',
        status: 'published' as 'draft' | 'published' | 'archived'
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Upload mode: 'file' | 'url'
    const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (existingCourse) {
            setFormData({
                title: existingCourse.title,
                media_url: '',
                date: (existingCourse.metadata as any)?.date || new Date(existingCourse.created_at).toISOString().split('T')[0],
                batch_id: (existingCourse as any).batch_id || '',
                status: existingCourse.status
            });
            // Existing videos: default to URL mode since we can't re-fetch the file
            setUploadMode('url');
        }
    }, [existingCourse]);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('video/')) {
            toast.error('Please select a video file (MP4, MOV, WebM, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024 * 1024) { // 5 GB limit
            toast.error('File too large. Maximum size is 5 GB.');
            return;
        }
        setVideoFile(file);
        setErrors(prev => ({ ...prev, media_url: '' }));
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, []);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.title.trim()) newErrors.title = 'Video Title is required';
        if (!isEdit) {
            if (uploadMode === 'file' && !videoFile) newErrors.media_url = 'Please select a video file to upload';
            if (uploadMode === 'url' && !formData.media_url.trim()) newErrors.media_url = 'Video URL is required';
        }
        if (!formData.batch_id) newErrors.batch_id = 'Assigning to a Batch is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            let mediaUrl = formData.media_url;

            // Upload video file to R2 if in file mode
            if (uploadMode === 'file' && videoFile && coachingId) {
                setIsUploading(true);
                // Simulate progress during upload (R2 doesn't give progress events via fetch)
                const progressInterval = setInterval(() => {
                    setUploadProgress(p => Math.min(p + 5, 90));
                }, 500);
                try {
                    mediaUrl = await r2.upload(coachingId, 'videos', videoFile, {
                        subFolder: formData.batch_id || 'misc',
                        entityType: 'course',
                        uploadedBy: user?.id,
                    });
                    setUploadProgress(100);
                } finally {
                    clearInterval(progressInterval);
                    setIsUploading(false);
                }
            }

            const courseData = {
                title: formData.title,
                description: `Video: ${formData.title}`,
                category: 'Video',
                batch_id: formData.batch_id,
                status: formData.status,
                metadata: { date: formData.date },
                total_videos: 1
            };

            let courseId = id;
            if (isEdit && id) {
                await updateCourse.mutateAsync({ courseId: id, updates: courseData });
            } else {
                const newCourse = await createCourse.mutateAsync(courseData);
                courseId = newCourse.id;
                await createContent.mutateAsync({
                    courseId,
                    contentData: {
                        title: formData.title,
                        type: 'video',
                        media_url: mediaUrl,
                        coaching_id: 'auto-filled',
                        status: 'published',
                        metadata: { date: formData.date }
                    }
                });
            }

            toast.success(isEdit ? 'Video updated!' : 'Video uploaded successfully!');
            if (formData.batch_id) {
                navigate(`/admin/dashboard/batches/${formData.batch_id}`);
            } else {
                navigate('/admin/dashboard/content');
            }
        } catch (error: any) {
            console.error('Failed to save video:', error);
            toast.error('Failed to save video: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    if (isLoading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Video' : 'Add New Video'}</h1>
                    <p className="text-gray-600 mt-1">Upload a video file or link an external URL</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="space-y-6">

                    {/* Video Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder="e.g. Physics - Chapter 1: Laws of Motion"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Upload Mode Toggle */}
                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Video Source <span className="text-red-500">*</span></label>

                            {/* Toggle Tabs */}
                            <div className="flex bg-gray-100 rounded-xl p-1 mb-4 w-fit">
                                <button
                                    type="button"
                                    onClick={() => { setUploadMode('file'); setVideoFile(null); }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${uploadMode === 'file' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    <Upload className="w-4 h-4" /> Upload File
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setUploadMode('url'); setVideoFile(null); }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${uploadMode === 'url' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
                                >
                                    <LinkIcon className="w-4 h-4" /> Paste URL
                                </button>
                            </div>

                            {/* File Upload Mode */}
                            {uploadMode === 'file' && (
                                <div>
                                    {!videoFile ? (
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'} ${errors.media_url ? 'border-red-400' : ''}`}
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={onDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Drag & drop your video here
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">or click to browse</p>
                                            <p className="text-xs text-gray-400">MP4, MOV, WebM, AVI · Max 5 GB</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="video/*"
                                                className="hidden"
                                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                            />
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Video className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{videoFile.name}</p>
                                                <p className="text-xs text-gray-500">{formatBytes(videoFile.size)} · {videoFile.type}</p>
                                                {isUploading && (
                                                    <div className="mt-2">
                                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-indigo-600 mt-1">Uploading to R2... {uploadProgress}%</p>
                                                    </div>
                                                )}
                                            </div>
                                            {!isUploading && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setVideoFile(null); setUploadProgress(0); }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* URL Mode */}
                            {uploadMode === 'url' && (
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.media_url}
                                        onChange={(e) => handleChange('media_url', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.media_url ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="Paste video URL (YouTube, Vimeo, S3, R2...)"
                                    />
                                </div>
                            )}

                            {errors.media_url && <p className="text-red-500 text-sm mt-1">{errors.media_url}</p>}
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Assign to Batch */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Batch <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={formData.batch_id}
                                onChange={(e) => handleChange('batch_id', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white ${errors.batch_id ? 'border-red-500' : 'border-gray-200'}`}
                            >
                                <option value="">Select a Batch</option>
                                {batches.map(batch => (
                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                ))}
                            </select>
                        </div>
                        {errors.batch_id && <p className="text-red-500 text-sm mt-1">{errors.batch_id}</p>}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                        {isSubmitting || isUploading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isUploading ? 'Uploading...' : 'Saving...'}</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" />{isEdit ? 'Update Video' : 'Save Video'}</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
