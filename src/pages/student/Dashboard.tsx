import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Video,
    FileText,
    TrendingUp,
    ChevronRight,
    Bell,
    Calendar,
    PlayCircle,
    Award,
    Radio,
    Clock,
    Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/app/providers/TenantProvider';
import { useBanners } from '@/hooks/data/useBanners';
import { useAnnouncements } from '@/hooks/data/useAnnouncements'; // Import hook
import { useExamGoal } from '@/contexts/ExamGoalContext';
import { ExamGoalSelector } from '@/components/student/ExamGoalSelector';
import { useLiveClasses, LiveClass } from '@/hooks/data/useLiveClasses';
import { useBatches } from '@/hooks/data/useBatches';
import { normalizeBatch } from '@/types/batch';
import { format } from 'date-fns';

// Assets
import dashboardBg from '@/assets/dashboard-bg.png';
import studentAvatar from '@/assets/student-avatar.png';

export const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { coaching } = useTenant();
    const { selectedGoal, openGoalSelector } = useExamGoal();
    const { data: banners = [] } = useBanners();
    const { data: announcements = [] } = useAnnouncements();
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // Dynamic banner gradient from admin branding settings
    const bannerGradient = coaching?.settings?.banner_gradient
        || 'linear-gradient(135deg, #f97316 0%, #ea580c 30%, #dc2626 65%, #7c3aed 100%)';

    // Fetch live classes and batches
    const { data: rawBatches = [] } = useBatches();
    const { data: allLiveClasses = [] } = useLiveClasses();

    // Filter banners for Student Dashboard
    const studentBanners = banners.filter((b: any) =>
        b.isActive &&
        b.type === 'student' &&
        (b.targetAudience === 'All' || b.targetAudience === selectedGoal.name)
    ).sort((a: any, b: any) => a.displayOrder - b.displayOrder);

    // Filter announcements (assuming 'active' or similar field exists, or just show recent)
    // For now, showing all or filtering by target audience if applicable in schema
    const recentAnnouncements = announcements
        .slice(0, 5); // Show top 5 recent

    // Banner Logic
    useEffect(() => {
        if (studentBanners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % studentBanners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [studentBanners.length]);

    // Get enrolled batch IDs
    const enrolledBatchIds = useMemo(() => {
        const batches = rawBatches.map(normalizeBatch);
        return new Set(batches.filter(b => b.isPurchased).map(b => b.id));
    }, [rawBatches]);

    // Filter and format today's classes
    const todayClasses = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);

        // Filter classes for enrolled batches, today's date, and not yet ended (when live ends, it disappears)
        const nowMs = now.getTime();
        let classes = allLiveClasses.filter(lc => {
            if (!lc.batch_id || !enrolledBatchIds.has(lc.batch_id)) return false;
            if (lc.status === 'cancelled' || lc.status === 'completed') return false;

            const scheduledDate = new Date(lc.scheduled_at);
            if (scheduledDate < startOfToday || scheduledDate >= endOfToday) return false;

            const endTimeMs = scheduledDate.getTime() + (lc.duration_minutes || 60) * 60 * 1000;
            if (endTimeMs <= nowMs) return false; // class has ended – don't show in today's schedule
            return true;
        });

        // Sort by scheduled time
        classes.sort((a, b) =>
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );

        // Format classes for display
        return classes.map(cls => {
            const scheduledDate = new Date(cls.scheduled_at);
            const endTime = new Date(scheduledDate.getTime() + cls.duration_minutes * 60000);
            const isLiveNow = cls.status === 'live' ||
                (now >= scheduledDate && now <= endTime && cls.status === 'scheduled');

            // Parse title to extract subject and topic (format: "Subject - Topic" or "Subject Topic")
            const titleParts = cls.title.split(' - ').map(s => s.trim());
            const subject = titleParts[0] || cls.title;
            const topic = titleParts[1] || cls.title;

            // Format duration (e.g., "1h", "1h 30m", "30m")
            const hours = Math.floor(cls.duration_minutes / 60);
            const minutes = cls.duration_minutes % 60;
            const durationText = hours > 0
                ? minutes > 0
                    ? `${hours}h ${minutes}m`
                    : `${hours}h`
                : `${minutes}m`;

            return {
                id: cls.id,
                subject: subject,
                topic: topic,
                time: format(scheduledDate, 'hh:mm a'),
                duration: durationText,
                status: isLiveNow ? 'Live Now' : 'Upcoming',
                scheduledAt: cls.scheduled_at,
                liveClass: cls
            };
        });
    }, [allLiveClasses, enrolledBatchIds]);

    const quickActions = [
        {
            title: 'My Courses',
            description: 'Resume learning',
            icon: BookOpen,
            path: '/student/dashboard/courses',
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50 text-blue-600'
        },
        {
            title: 'Live Classes',
            description: 'Join now',
            icon: Video,
            path: '/student/dashboard/live-classes',
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50 text-purple-600'
        },
        {
            title: 'Tests',
            description: 'Pending tests',
            icon: FileText,
            path: '/student/dashboard/tests',
            color: 'from-emerald-500 to-emerald-600',
            bg: 'bg-emerald-50 text-emerald-600'
        },
        {
            title: 'Performance',
            description: 'View analysis',
            icon: TrendingUp,
            path: '/student/dashboard/performance',
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50 text-amber-600'
        }
    ];

    return (
        <div className="space-y-5 w-full">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl shadow-xl min-h-[160px] md:min-h-[260px] flex items-center"
                style={{ background: bannerGradient }}
            >
                {/* Background Image Overlay */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${dashboardBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 w-full px-4 md:px-10 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center md:text-left">
                        <button
                            onClick={openGoalSelector}
                            className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium mb-2 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            🎓 {selectedGoal.name} Aspirant
                        </button>
                        <h2 className="text-xl md:text-4xl font-bold text-white mb-1 font-display">
                            Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}!
                        </h2>
                        <p className="text-blue-100 text-sm md:text-lg max-w-xl mb-3">
                            You have <span className="font-bold text-white">{todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'}</span> scheduled for today.
                            Keep up the momentum!
                        </p>

                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <button
                                onClick={() => navigate('/student/dashboard/courses')}
                                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-white text-[#1E3A8A] rounded-xl font-bold shadow-md hover:shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 text-sm sm:text-base"
                            >
                                <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                Resume Learning
                            </button>
                            <button
                                onClick={() => navigate('/student/dashboard/live-classes')}
                                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-[#ffffff20] backdrop-blur-md border border-white/30 text-white rounded-xl font-semibold hover:bg-[#ffffff30] transition-all text-sm sm:text-base"
                            >
                                View Schedule
                            </button>
                        </div>
                    </div>

                    {/* 3D Illustration */}
                    <div className="hidden md:block w-64 h-64 md:w-72 md:h-72 flex-shrink-0 -mr-4 -mb-12 scale-[1.4]">
                        <img
                            src={studentAvatar}
                            alt="Student"
                            className="w-full h-full object-contain drop-shadow-2xl animate-float "
                        />
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {quickActions.map((action, index) => (
                    <motion.button
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => navigate(action.path)}
                        className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />

                        <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                            {action.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            {action.description}
                        </p>

                        <div className="flex items-center text-sm font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                            Access Now <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Content - Left */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Banners Carousel */}
                    {studentBanners.length > 0 && (
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                <h3 className="font-bold text-slate-800">Featured Updates</h3>
                            </div>
                            <div className="relative rounded-xl overflow-hidden aspect-[21/9] group">
                                <div
                                    className="flex transition-transform duration-500 h-full"
                                    style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                                >
                                    {studentBanners.map((banner: any) => (
                                        <div key={banner.id} className="min-w-full relative h-full">
                                            <img
                                                src={banner.imageUrl}
                                                alt={banner.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                                                <h3 className="text-xl font-bold mb-1">{banner.title}</h3>
                                                <p className="text-sm text-white/90 line-clamp-1">{banner.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Indicators */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {studentBanners.map((_: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${currentBannerIndex === idx ? 'bg-white w-4' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Today's Schedule */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-lg text-slate-800">Today's Schedule</h3>
                            </div>
                            <button
                                onClick={() => navigate('/student/dashboard/live-classes')}
                                className="text-sm text-blue-600 font-semibold hover:underline"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-3">
                            {todayClasses.length > 0 ? (
                                todayClasses.map((cls) => {
                                    const scheduledTime = new Date(cls.scheduledAt).getTime();
                                    const now = Date.now();
                                    const hasStarted = now >= scheduledTime || cls.status === 'Live Now';
                                    return (
                                        <div key={cls.id} className="bg-red-50/80 border border-red-100 rounded-xl px-5 py-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white border border-red-200 flex items-center justify-center flex-shrink-0">
                                                    <Radio className="w-5 h-5 text-red-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-base">{cls.subject} - {cls.topic}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                            {format(new Date(cls.scheduledAt), 'MMM dd, yyyy')}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-red-500" />
                                                            {cls.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                disabled={!hasStarted}
                                                onClick={() => {
                                                    if (hasStarted && cls.liveClass?.meeting_link) {
                                                        navigate(`/student/player/${cls.id}`, {
                                                            state: {
                                                                videoUrl: cls.liveClass.meeting_link,
                                                                classTitle: `${cls.subject} - ${cls.topic}`,
                                                                batchTitle: null
                                                            }
                                                        });
                                                    } else if (hasStarted) {
                                                        navigate('/student/dashboard/live-classes');
                                                    }
                                                }}
                                                className={`px-5 py-2 rounded-xl font-semibold text-sm transition-colors flex-shrink-0 flex items-center gap-2 ${hasStarted
                                                    ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                {!hasStarted && <Lock className="w-4 h-4" />}
                                                {hasStarted ? 'Join Live' : 'Locked'}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">No classes scheduled for today</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Right */}
                <div className="space-y-6">
                    {/* Notice Board */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-5 h-5 text-orange-500" />
                            <h3 className="font-bold text-slate-800">Notice Board</h3>
                        </div>
                        <div className="space-y-4">
                            {recentAnnouncements.length > 0 ? recentAnnouncements.map((announcement: any, i: number) => (
                                <div key={i} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            {announcement.type || 'Update'}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(announcement.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 hover:text-blue-600 cursor-pointer transition-colors">
                                        {announcement.title}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-4">No new notices</p>
                            )}
                        </div>
                        <button className="w-full mt-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 border-t border-slate-100">
                            View All Notices
                        </button>
                    </div>

                    {/* Progress Widget */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white text-center">
                        <div className="mb-4">
                            <div className="w-16 h-16 mx-auto rounded-full border-4 border-white/20 flex items-center justify-center">
                                <span className="text-2xl font-bold">78%</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg mb-1">Course Progress</h3>
                        <p className="text-blue-100 text-sm mb-4">You are doing great! Keep it up.</p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
