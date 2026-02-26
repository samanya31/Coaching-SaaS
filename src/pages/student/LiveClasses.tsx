import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Calendar, Search, Video, Loader2, Clock, Lock } from 'lucide-react';
import { useLiveClasses, LiveClass } from '@/hooks/data/useLiveClasses';
import { useBatches } from '@/hooks/data/useBatches';
import { normalizeBatch } from '@/types/batch';
import { YouTubeLivePlayer } from '@/components/video/YouTubeLivePlayer';
import { format } from 'date-fns';
import liveHero from '@/assets/live.png';

export const StudentLiveClasses = () => {
    const navigate = useNavigate();
    const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: rawBatches = [], isLoading: batchesLoading } = useBatches();
    const { data: allLiveClasses = [], isLoading: classesLoading } = useLiveClasses();

    const isLoading = batchesLoading || classesLoading;

    // Get enrolled batch IDs
    const enrolledBatchIds = useMemo(() => {
        const batches = rawBatches.map(normalizeBatch);
        return new Set(batches.filter(b => b.isPurchased).map(b => b.id));
    }, [rawBatches]);

    // All enrolled classes (for search)
    const enrolledClassesBase = useMemo(() => {
        return allLiveClasses.filter(lc =>
            lc.batch_id && enrolledBatchIds.has(lc.batch_id)
        );
    }, [allLiveClasses, enrolledBatchIds]);

    // Upcoming & Live only: class has not ended (end time > now) or is live. Past classes disappear.
    const upcomingOrLive = useMemo(() => {
        const nowMs = Date.now();
        let classes = enrolledClassesBase.filter(lc => {
            const endMs = new Date(lc.scheduled_at).getTime() + (lc.duration_minutes || 60) * 60 * 1000;
            const notEnded = endMs > nowMs;
            const isLive = lc.status === 'live';
            const valid = lc.status !== 'cancelled' && lc.status !== 'completed';
            return valid && (notEnded || isLive);
        });
        if (searchQuery) {
            classes = classes.filter(lc =>
                lc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lc.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return classes.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    }, [enrolledClassesBase, searchQuery]);


    const formatDate = (dateStr: string) => {
        try { return format(new Date(dateStr), 'MMM dd, yyyy'); }
        catch { return dateStr; }
    };

    const formatTime = (dateStr: string) => {
        try { return format(new Date(dateStr), 'hh:mm a'); }
        catch { return ''; }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Full-screen video player modal */}
            {selectedClass && selectedClass.meeting_link && (
                <div className="fixed inset-0 z-50 bg-black">
                    <YouTubeLivePlayer
                        videoId={selectedClass.meeting_link}
                        title={selectedClass.title}
                        isLive={selectedClass.status === 'live'}
                        onClose={() => setSelectedClass(null)}
                    />
                </div>
            )}

            {/* Header */}
            <div className="relative text-white py-8 px-4 overflow-hidden rounded-2xl mx-2 mt-2">
                <img
                    src={liveHero}
                    alt="Live Classes"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/40 rounded-2xl" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Video className="w-6 h-6" />
                        <h1 className="text-xl font-bold">Live Classes</h1>
                    </div>
                    <p className="text-white/80 text-sm">Join upcoming sessions and access previous recordings</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
                {/* Search Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search live classes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading your live classes...</p>
                    </div>
                ) : enrolledBatchIds.size === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <div className="text-6xl mb-4">📹</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No live classes yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Enroll in a batch to see its live classes and recordings.
                        </p>
                        <a
                            href="/student/dashboard/batches"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Browse Batches
                        </a>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Upcoming & Live – past classes (e.g. 13 Feb) no longer appear here */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Radio className="w-5 h-5 text-red-500" />
                                Upcoming & Live ({upcomingOrLive.length})
                            </h2>
                            {upcomingOrLive.length === 0 ? (
                                <div className="bg-white rounded-xl py-8 text-center text-gray-500 text-sm">
                                    No upcoming sessions. Past classes appear under Recordings when available.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingOrLive.map((liveClass) => {
                                        const scheduledTime = new Date(liveClass.scheduled_at).getTime();
                                        const now = Date.now();
                                        const hasStarted = now >= scheduledTime || liveClass.status === 'live';
                                        return (
                                            <div
                                                key={liveClass.id}
                                                className="bg-red-50/80 border border-red-100 rounded-xl px-5 py-4 flex items-center justify-between hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white border border-red-200 flex items-center justify-center flex-shrink-0">
                                                        <Radio className="w-5 h-5 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-base">{liveClass.title}</h3>
                                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                                {formatDate(liveClass.scheduled_at)}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5 text-red-500" />
                                                                {formatTime(liveClass.scheduled_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    disabled={!hasStarted}
                                                    onClick={() => hasStarted && liveClass.meeting_link ? setSelectedClass(liveClass) : null}
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
                                    })}
                                </div>
                            )}
                        </section>


                    </div>
                )}
            </div>
        </div>
    );
};
