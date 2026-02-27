import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock, Users, Star, IndianRupee, FileText, Video, File as FileIcon, Download, Eye, LayoutGrid, VideoIcon, Radio, Hourglass } from 'lucide-react';
import { downloadFile } from '@/utils/file.utils';
import { useQueryClient } from '@tanstack/react-query';
import { useBatch, batchKeys } from '@/hooks/data/useBatches';
import { useLiveClasses } from '@/hooks/data/useLiveClasses';
import { useCourses } from '@/hooks/data/useCourses';
import { useStudyMaterials } from '@/hooks/data/useStudyMaterials';
import { normalizeBatch } from '@/types/batch';
import { ClassCard } from '@/components/student/ClassCard';
import { PaymentModal } from '@/components/student/PaymentModal';
import { enrollmentService } from '@/services/api/enrollment.service';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/app/providers/TenantProvider';

interface ClassCardData {
    id: string;
    title: string;
    description: string;
    subject: string;
    instructor: string;
    date: string;
    startTime: string;
    duration: string;
    type: 'live' | 'recorded' | 'upcoming';
    thumbnail: string;
    videoUrl?: string;
    liveUrl?: string;
}

export const BatchDetail = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();

    // Fetch batch data
    const { data: rawBatch, isLoading: isBatchLoading } = useBatch(batchId);
    const batch = rawBatch ? normalizeBatch(rawBatch) : null;

    // Fetch live classes and recorded courses (real data from DB)
    const { data: rawClasses = [], isLoading: isClassesLoading } = useLiveClasses({ batchId });
    const { data: batchCourses = [], isLoading: isCoursesLoading } = useCourses({ batchId, status: 'published' });

    // Fetch course content for all courses to get media_url
    const [courseContentsMap, setCourseContentsMap] = useState<Record<string, any>>({});
    useEffect(() => {
        if (batchCourses.length === 0) {
            setCourseContentsMap({});
            return;
        }
        const fetchCourseContents = async () => {
            const { supabase } = await import('@/config/supabase');
            const courseIds = batchCourses.map(c => c.id);
            if (courseIds.length === 0) return;

            const { data, error } = await supabase
                .from('course_content')
                .select('*, course_id')
                .in('course_id', courseIds)
                .eq('status', 'published')
                .order('order_index', { ascending: true });

            if (!error && data) {
                const map: Record<string, any> = {};
                data.forEach((content: any) => {
                    if (!map[content.course_id]) {
                        map[content.course_id] = [];
                    }
                    map[content.course_id].push(content);
                });
                setCourseContentsMap(map);
            } else if (error) {
                console.error('Error fetching course content:', error);
            }
        };
        fetchCourseContents();
    }, [batchCourses.length, batchCourses.map(c => c.id).join(',')]);

    // Map raw classes to UI format; classify by end time - past classes without recordings DISAPPEAR (not show as completed)
    const now = Date.now();
    const liveClasses = rawClasses
        .filter(c => {
            const startMs = new Date(c.scheduled_at).getTime();
            const endMs = startMs + (c.duration_minutes || 60) * 60 * 1000;
            const isPast = now > endMs;
            const hasRecording = !!c.recording_url;
            // Only include if: not past, OR (past but has recording), OR is live
            return !isPast || hasRecording || c.status === 'live';
        })
        .map(c => {
            const startMs = new Date(c.scheduled_at).getTime();
            const endMs = startMs + (c.duration_minutes || 60) * 60 * 1000;
            const isLive = c.status === 'live' || (now >= startMs && now <= endMs && c.status !== 'completed' && c.status !== 'cancelled');
            const hasRecording = !!c.recording_url;
            const isPast = now > endMs;
            const type: 'live' | 'recorded' | 'upcoming' =
                isLive ? 'live'
                    : hasRecording && isPast ? 'recorded'
                        : 'upcoming';
            return {
                id: c.id,
                title: c.title,
                description: c.description || '',
                subject: 'General',
                instructor: batch?.instructor || 'Instructor',
                date: c.scheduled_at,
                startTime: new Date(c.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                duration: c.duration_minutes + ' min',
                type,
                thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
                videoUrl: c.recording_url,
                liveUrl: c.meeting_link
            };
        });

    // Map courses (recorded content from admin Videos tab) to UI format
    const recordedCourses = batchCourses
        .map(course => {
            const contents = courseContentsMap[course.id] || [];
            const firstContent = contents[0];
            const mediaUrl = firstContent?.media_url;
            const date = course.metadata?.date || course.created_at;
            return {
                id: course.id,
                title: course.title,
                description: course.description || '',
                subject: 'General',
                instructor: batch?.instructor || 'Instructor',
                date: date,
                startTime: new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                duration: course.duration_hours ? `${course.duration_hours}h` : (firstContent?.duration_seconds ? `${Math.floor(firstContent.duration_seconds / 60)} min` : 'N/A'),
                type: 'recorded' as const,
                thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
                videoUrl: mediaUrl,
                liveUrl: undefined
            };
        })
        .filter(c => c.videoUrl); // Only include courses with media_url

    // Combine live classes and recorded courses
    const classes = [...liveClasses, ...recordedCourses];

    const [view, setView] = useState<'classes' | 'materials'>('classes');
    const [filter, setFilter] = useState<'all' | 'recorded' | 'live' | 'upcoming'>('all');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Fetch study materials for this batch
    const { data: studyMaterials = [], isLoading: isMaterialsLoading } = useStudyMaterials(batchId);

    const { user } = useAuth();
    const { coachingId } = useTenant();
    const queryClient = useQueryClient();

    const isLoading = isBatchLoading || isClassesLoading || isCoursesLoading || isMaterialsLoading;

    const handlePaymentConfirm = async (paymentDetails: { method: string; transactionId?: string }) => {
        if (!user || !batch) return;
        try {
            await enrollmentService.enrollStudent(
                coachingId!,
                user.id,
                batch.id,
                batch.price || 0,
                paymentDetails
            );
            setShowPaymentModal(false);
            queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId!) });
            alert('Enrollment Successful!');
        } catch (error) {
            console.error('Enrollment failed:', error);
            alert('Enrollment Failed. Please try again.');
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const handleClassClick = (classData: ClassCardData) => {
        if (classData.type === 'recorded' || classData.type === 'live') {
            // Navigate to video player
            navigate(`/student/player/${classData.id}`, {
                state: {
                    videoUrl: classData.videoUrl || classData.liveUrl,
                    classTitle: classData.title,
                    batchTitle: batch?.title
                }
            });
        }
    };

    const filteredClasses = classes.filter(cls => {
        if (filter === 'all') return true;
        return cls.type === filter;
    });

    const getFileIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('pdf')) return <FileText className="w-5 h-5 text-indigo-600" />;
        if (lowerType.includes('video') || lowerType.includes('mp4')) return <Video className="w-5 h-5 text-red-600" />;
        return <FileIcon className="w-5 h-5 text-gray-600" />;
    };

    if (!batch) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Batch Not Found</h2>
                    <button
                        onClick={() => navigate('/student/batches')}
                        className="text-indigo-600 hover:underline"
                    >
                        ← Back to Batches
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-8 px-4">
                <button
                    onClick={() => navigate('/student/batches')}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Back to Batches</span>
                </button>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Batch Info */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {batch.examGoal}
                            </span>
                            {batch.isPurchased && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Enrolled
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                            {batch.title}
                        </h1>
                        <p className="text-gray-600 text-lg max-w-3xl leading-relaxed">
                            {batch.description}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* View Toggle */}
            <div className="px-4 mt-6">
                <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
                    <button
                        onClick={() => setView('classes')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'classes'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Classes
                    </button>
                    <button
                        onClick={() => setView('materials')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'materials'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Study Materials
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 py-6">
                {view === 'classes' ? (
                    <>
                        {/* Filter Tabs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                                        <CalendarDays className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 leading-none">Class Schedule</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">{classes.length} total classes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                {([
                                    { key: 'all' as const, label: 'All', Icon: LayoutGrid, count: classes.length, activeGrad: 'from-indigo-500 to-indigo-600', activeShadow: 'shadow-indigo-200/60', badgeBg: 'bg-indigo-50 text-indigo-600', hoverBorder: 'hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50' },
                                    { key: 'recorded' as const, label: 'Recorded', Icon: VideoIcon, count: classes.filter(c => c.type === 'recorded').length, activeGrad: 'from-violet-500 to-purple-600', activeShadow: 'shadow-violet-200/60', badgeBg: 'bg-violet-50 text-violet-600', hoverBorder: 'hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50' },
                                    { key: 'live' as const, label: 'Live', Icon: Radio, count: classes.filter(c => c.type === 'live').length, activeGrad: 'from-rose-500 to-red-500', activeShadow: 'shadow-rose-200/60', badgeBg: 'bg-rose-50 text-rose-600', hoverBorder: 'hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50' },
                                    { key: 'upcoming' as const, label: 'Upcoming', Icon: Hourglass, count: classes.filter(c => c.type === 'upcoming').length, activeGrad: 'from-amber-400 to-orange-500', activeShadow: 'shadow-amber-200/60', badgeBg: 'bg-amber-50 text-amber-600', hoverBorder: 'hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50' },
                                ]).map(({ key, label, Icon, count, activeGrad, activeShadow, badgeBg, hoverBorder }) => {
                                    const isActive = filter === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setFilter(key)}
                                            className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 select-none ${isActive
                                                    ? `bg-gradient-to-r ${activeGrad} text-white border-transparent shadow-lg ${activeShadow} -translate-y-0.5`
                                                    : `bg-white text-gray-500 border-gray-200 ${hoverBorder} hover:-translate-y-px hover:shadow-sm`
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span>{label}</span>
                                            <span className={`inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/25 text-white' : badgeBg
                                                }`}>{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>


                        {/* Classes List */}
                        {filteredClasses.length > 0 ? (
                            <div className="space-y-3">
                                {filteredClasses.map((classData, index) => (
                                    <ClassCard
                                        key={classData.id}
                                        classData={classData}
                                        onClick={() => handleClassClick(classData)}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl">
                                <div className="text-6xl mb-4">📅</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No {filter} classes
                                </h3>
                                <p className="text-gray-600">
                                    {filter === 'all'
                                        ? 'No classes available yet'
                                        : `No ${filter} classes available`}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Study Materials List */}
                        {studyMaterials.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {studyMaterials.map((material: any, index: number) => (
                                    <motion.div
                                        key={material.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                                            {getFileIcon(material.file_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 line-clamp-1">{material.title}</h3>
                                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{material.description || 'No description'}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">{new Date(material.created_at).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-3">
                                                    <a
                                                        href={material.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" /> View
                                                    </a>
                                                    <button
                                                        onClick={() => downloadFile(material.file_url, material.title)}
                                                        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" /> Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl">
                                <div className="text-6xl mb-4">📂</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No study materials
                                </h3>
                                <p className="text-gray-600">
                                    Materials uploaded by your instructor will appear here.
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Purchase CTA for unpurchased batches */}
                {!batch.isPurchased && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-auto bg-white rounded-2xl shadow-2xl p-6 border border-gray-200"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Enroll in this batch
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Get access to all {batch.totalClasses} classes and materials
                        </p>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1">
                                <IndianRupee className="w-6 h-6 text-gray-700" />
                                <span className="text-3xl font-bold text-gray-900">
                                    {batch.price.toLocaleString()}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Enroll Now
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                amount={batch.price || 0}
                courseTitle={batch.title}
                onConfirm={handlePaymentConfirm}
            />
        </div>
    );
};
