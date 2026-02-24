import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Users, Video, Clock, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveClasses, useDeleteLiveClass, LiveClass } from '@/hooks/data/useLiveClasses';
import { useBatches } from '@/hooks/data/useBatches';

export const LiveClasses = () => {
    const { data: liveClassesData = [], isLoading } = useLiveClasses();
    const { data: batchesData = [] } = useBatches();
    const { mutate: deleteLiveClass } = useDeleteLiveClass();

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredClasses = liveClassesData.filter(cls => {
        const matchesSearch = cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.instructor.toLowerCase().includes(searchQuery.toLowerCase());

        const isPast = new Date(cls.scheduled_at) < new Date() && cls.status !== 'live';
        const matchesTab = activeTab === 'upcoming' ? !isPast : isPast;

        return matchesSearch && matchesTab;
    }).sort((a, b) => {
        return activeTab === 'upcoming'
            ? new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
            : new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
    });

    const getBatchName = (batchId?: string) => {
        return batchesData.find(b => b.id === batchId)?.name || 'N/A';
    };

    const StatusBadge = ({ status }: { status: LiveClass['status'] }) => {
        const styles = {
            scheduled: 'bg-blue-100 text-blue-700',
            live: 'bg-red-100 text-red-700 animate-pulse',
            completed: 'bg-gray-100 text-gray-700',
            cancelled: 'bg-orange-100 text-orange-700'
        };

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${styles[status]}`}>
                {status === 'live' ? '● LIVE' : status}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading live classes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
                    <p className="text-gray-600 mt-1">Schedule and manage live interactive sessions.</p>
                </div>
                <Link to="/admin/dashboard/live-classes/new">
                    <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                        <Plus className="w-4 h-4 mr-2" /> Schedule Class
                    </Button>
                </Link>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Upcoming ({liveClassesData.filter(c => new Date(c.scheduled_at) >= new Date() || c.status === 'live').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Past Classes
                    </button>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search classes or instructors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Classes List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class Info</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredClasses.length > 0 ? (
                                filteredClasses.map((cls) => (
                                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-red-50 rounded-lg">
                                                    <Video className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{cls.title}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Users className="w-3 h-3" />
                                                        Instructor: {cls.instructor}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {getBatchName(cls.batch_id)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(cls.scheduled_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {cls.duration_minutes} mins
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={cls.status} />
                                                {cls.status === 'live' && (
                                                    <a
                                                        href={cls.meeting_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Join Meeting                          Join <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative group inline-block">
                                                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block z-10">
                                                    <Link to={`/admin/dashboard/live-classes/${cls.id}/edit`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to cancel this class?')) {
                                                                deleteLiveClass(cls.id);
                                                            }
                                                        }}
                                                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Cancel Class
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 bg-gray-50 rounded-b-xl border-t border-dashed border-gray-200">
                                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
                                        <p className="text-gray-500">
                                            {activeTab === 'upcoming'
                                                ? "No upcoming live sessions scheduled."
                                                : "No past class history found."}
                                        </p>
                                        {activeTab === 'upcoming' && (
                                            <div className="mt-4">
                                                <Link to="/admin/dashboard/live-classes/new">
                                                    <Button variant="outline">
                                                        Schedule One Now
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
