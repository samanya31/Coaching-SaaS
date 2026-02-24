import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, BookOpen, Calendar, DollarSign, Clock, Star, TrendingUp, Video, PlayCircle, FileText, Plus, MoreVertical, Trash2, FileDown, Link as LinkIcon, Download, ExternalLink, X, Loader2, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBatch, useBatchStudents } from '@/hooks/data/useBatches';
import { useLiveClasses, useDeleteLiveClass } from '@/hooks/data/useLiveClasses';
import { useCourses, useDeleteCourse } from '@/hooks/data/useCourses';
import { useStudyMaterials, useCreateStudyMaterial, useDeleteStudyMaterial } from '@/hooks/data/useStudyMaterials';
import { useTenant } from '@/app/providers/TenantProvider';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import r2 from '@/services/r2.service';
import { downloadFile } from '@/utils/file.utils';
import { useCallback, useRef, useEffect } from 'react';

export const BatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'videos' | 'students' | 'tests' | 'materials'>('overview');
    const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
    const [materialForm, setMaterialForm] = useState({ title: '', description: '', file_url: '', is_public: false });
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
        setSelectedFile(file);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, []);

    // Fetch data
    const { data: batch, isLoading: isBatchLoading } = useBatch(id);
    const { data: enrolledStudents = [], isLoading: isStudentsLoading } = useBatchStudents(id);
    const { data: liveClasses = [], isLoading: isClassesLoading } = useLiveClasses({ batchId: id });
    const { data: batchCourses = [], isLoading: isCoursesLoading } = useCourses({ batchId: id });
    const { data: studyMaterials = [], isLoading: isMaterialsLoading } = useStudyMaterials(id);
    const { mutate: deleteLiveClass } = useDeleteLiveClass();
    const { mutate: deleteCourse } = useDeleteCourse();
    const { mutate: createMaterial, isPending: isCreatingMaterial } = useCreateStudyMaterial();
    const { mutate: deleteMaterial } = useDeleteStudyMaterial();

    const isLoading = isBatchLoading || isStudentsLoading || isClassesLoading || isCoursesLoading || isMaterialsLoading;

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batch) return;

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

        try {
            let fileUrl = materialForm.file_url;

            if (uploadMode === 'file' && selectedFile && coachingId) {
                setIsUploading(true);
                const progressInterval = setInterval(() => {
                    setUploadProgress(p => Math.min(p + 10, 90));
                }, 300);

                try {
                    fileUrl = await r2.upload(coachingId, 'materials', selectedFile, {
                        subFolder: id || 'batch',
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
                batch_id: materialForm.is_public ? undefined : id!,
                coaching_id: batch.coaching_id,
                title: materialForm.title,
                description: materialForm.description,
                file_url: fileUrl,
                is_public: materialForm.is_public
            }, {
                onSuccess: () => {
                    setIsAddMaterialOpen(false);
                    setMaterialForm({ title: '', description: '', file_url: '', is_public: false });
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Batch Not Found</h2>
                <Button onClick={() => navigate('/admin/dashboard/batches')} className="mt-4">Back to Batches</Button>
            </div>
        );
    }

    const totalRevenue = (batch.price ?? batch.fee_amount ?? 0) * (batch.students ?? enrolledStudents.length ?? 0);

    const formatPrice = (price: number) => `₹${(price || 0).toLocaleString('en-IN')}`;
    const formatRevenue = (revenue: number) => {
        if (revenue >= 10000000) return `₹${(revenue / 10000000).toFixed(2)}Cr`;
        if (revenue >= 100000) return `₹${(revenue / 100000).toFixed(2)}L`;
        return `₹${(revenue / 1000).toFixed(0)}K`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard/batches')} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{batch.title || batch.name}</h1>
                        <p className="text-gray-600 mt-1">{batch.examGoal || batch.exam_goal} • {batch.students || enrolledStudents.length} Students</p>
                    </div>
                </div>
                <Link to={`/admin/dashboard/batches/${id}/edit`}>
                    <Button variant="outline">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Batch
                    </Button>
                </Link>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {[
                        { id: 'overview', label: 'Overview', icon: BookOpen },
                        { id: 'videos', label: 'Videos', icon: PlayCircle },
                        { id: 'classes', label: 'Live Classes', icon: Video },
                        { id: 'students', label: 'Students', icon: Users },
                        { id: 'materials', label: 'Study Materials', icon: FileDown },
                        { id: 'tests', label: 'Tests', icon: FileText },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatRevenue(totalRevenue)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500">Enrolled Students</p>
                                <p className="text-2xl font-bold text-gray-900">{batch.students || enrolledStudents.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500">Live Classes</p>
                                <p className="text-2xl font-bold text-gray-900">{liveClasses.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500">Recorded Videos</p>
                                <p className="text-2xl font-bold text-gray-900">{batchCourses.reduce((acc: number, c: any) => acc + (c.total_videos || 0), 0)}</p>
                            </div>
                        </div>

                        {/* Batch Instructor & Details */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Instructor</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                                            {batch.instructorAvatar || '👨‍🏫'}
                                        </div>
                                        <p className="font-medium text-gray-900">{batch.instructor || (batch.metadata as any)?.instructor || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Start Date</p>
                                        <p className="font-medium text-gray-900">{batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">End Date</p>
                                        <p className="font-medium text-gray-900">{batch.end_date ? new Date(batch.end_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Price</p>
                                        <p className="font-medium text-gray-900">{formatPrice(batch.price)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Status</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {batch.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <p className="text-sm text-gray-500 mb-1">Description</p>
                                <p className="text-gray-700">{batch.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIDEOS TAB */}
                {activeTab === 'videos' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Recorded Content</h2>
                            <Link to={`/admin/dashboard/content/new?batchId=${id}`}>
                                <Button className="bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="w-4 h-4 mr-2" /> Add Video/Course
                                </Button>
                            </Link>
                        </div>

                        {batchCourses.length > 0 ? (
                            <div className="space-y-4">
                                {batchCourses.map((course: any) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                                                <PlayCircle className="w-6 h-6 text-indigo-600 ml-0.5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-1 text-base">{course.title}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {(course.metadata?.date && new Date(course.metadata.date).toLocaleDateString()) || new Date(course.created_at).toLocaleDateString()}
                                                    </span>
                                                    {course.duration_hours && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {course.duration_hours}h
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link to={`/admin/dashboard/content/${course.id}/edit`}>
                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6">
                                                    Play
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this video?')) {
                                                        deleteCourse(course.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No videos added yet</h3>
                                <p className="text-gray-500 mb-4">Upload recorded lectures or course material.</p>
                                <Link to={`/admin/dashboard/content/new?batchId=${id}`}>
                                    <Button variant="outline">Add First Video</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* CLASSES TAB (LIVE) */}
                {activeTab === 'classes' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Live Schedule</h2>
                            <Link to={`/admin/dashboard/live-classes/new?batchId=${id}`}>
                                <Button className="bg-red-600 hover:bg-red-700">
                                    <Plus className="w-4 h-4 mr-2" /> Schedule Class
                                </Button>
                            </Link>
                        </div>

                        {liveClasses.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="divide-y divide-gray-100">
                                    {liveClasses.map((cls) => (
                                        <div key={cls.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                                                    <Video className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{cls.title}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(cls.scheduled_at).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls.status === 'live' ? 'bg-red-100 text-red-700 animate-pulse' :
                                                            cls.status === 'completed' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {cls.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link to={`/admin/dashboard/live-classes/${cls.id}/edit`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit2 className="w-4 h-4" /></Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => {
                                                        if (confirm('Cancel this class?')) deleteLiveClass(cls.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No live classes scheduled</h3>
                                <p className="text-gray-500 mb-4">Schedule your first live session for this batch.</p>
                                <Link to={`/admin/dashboard/live-classes/new?batchId=${id}`}>
                                    <Button variant="outline">Schedule Class</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* STUDENTS TAB */}
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Enrolled Students ({enrolledStudents.length})</h2>
                            <Link to="/admin/dashboard/students">
                                <Button variant="outline">Manage All Students</Button>
                            </Link>
                        </div>

                        {enrolledStudents.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {enrolledStudents.map((enrollment: any) => (
                                            <tr key={enrollment.user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                            {enrollment.user.full_name?.charAt(0)}
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">{enrollment.user.full_name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enrollment.user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(enrollment.enrolled_at || enrollment.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link to={`/admin/dashboard/students/${enrollment.user.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No students enrolled</h3>
                            </div>
                        )}
                    </div>
                )}

                {/* STUDY MATERIALS TAB */}
                {activeTab === 'materials' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Study Materials</h2>
                            <Button onClick={() => setIsAddMaterialOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="w-4 h-4 mr-2" /> Add Material
                            </Button>
                        </div>

                        {studyMaterials.length > 0 ? (
                            <div className="space-y-4">
                                {studyMaterials.map((material) => (
                                    <div key={material.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-100 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                                                <FileDown className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-1 text-base">{material.title}</h3>
                                                {material.description && (
                                                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{material.description}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(material.created_at).toLocaleDateString()}
                                                    </span>
                                                    {material.uploader?.full_name && (
                                                        <span>• {material.uploader.full_name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline" className="rounded-lg">
                                                    <ExternalLink className="w-4 h-4 mr-2" /> Open
                                                </Button>
                                            </a>
                                            <Button
                                                size="sm"
                                                onClick={() => downloadFile(material.file_url, material.title)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                            >
                                                <Download className="w-4 h-4 mr-2" /> Download
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this material?')) {
                                                        deleteMaterial(material.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <FileDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No study materials yet</h3>
                                <p className="text-gray-500 mb-4">Add PDFs, documents, or other study materials.</p>
                                <Button variant="outline" onClick={() => setIsAddMaterialOpen(true)}>Add First Material</Button>
                            </div>
                        )}

                        {/* Add Material Modal */}
                        {isAddMaterialOpen && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAddMaterialOpen(false)}>
                                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Add Study Material</h3>
                                    <form onSubmit={handleAddMaterial} className="space-y-4">

                                        {/* Current Affairs Toggle */}
                                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                            <input
                                                type="checkbox"
                                                id="bd_is_public"
                                                checked={materialForm.is_public}
                                                onChange={(e) => setMaterialForm({ ...materialForm, is_public: e.target.checked })}
                                                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                            />
                                            <label htmlFor="bd_is_public" className="text-sm font-medium text-amber-900 cursor-pointer select-none">
                                                Mark as Current Affairs (Visible to All)
                                            </label>
                                        </div>

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
                                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                                File Source *
                                            </label>

                                            <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => { setUploadMode('file'); setSelectedFile(null); }}
                                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${uploadMode === 'file' ? 'bg-white shadow text-emerald-600' : 'text-gray-600'}`}
                                                >
                                                    <UploadIcon className="w-3.5 h-3.5" /> Upload File
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
                                                            <UploadIcon className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
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
                )}

                {/* TESTS TAB */}
                {activeTab === 'tests' && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Tests Module Coming Soon</h3>
                        <p className="text-gray-500">Create and assign tests to this batch.</p>
                        <Button variant="outline" disabled className="mt-4">Create Test</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
