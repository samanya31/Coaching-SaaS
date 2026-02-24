import { Users, GraduationCap, Video, Plus, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useUserCounts } from '@/hooks/data/useUsers';
import { useBatches } from '@/hooks/data/useBatches';
import { useUpcomingLiveClasses } from '@/hooks/data/useLiveClasses';

export const AdminDashboard = () => {
    // 1. Fetch Real Data
    const { data: userCounts } = useUserCounts();
    const { data: batches = [] } = useBatches();
    const { data: upcomingClasses = [] } = useUpcomingLiveClasses();

    const activeBatchesCount = batches.filter(b => b.status === 'active').length;
    const todayClassesCount = upcomingClasses.filter(c => {
        const classDate = new Date(c.scheduled_at).toDateString();
        const today = new Date().toDateString();
        return classDate === today;
    }).length;

    // 2. Metrics Configuration
    const statsCards = [
        {
            title: 'Total Students',
            value: userCounts?.total?.toLocaleString() || '0',
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
            subtext: null
        },
        {
            title: 'Active Batches',
            value: activeBatchesCount.toString(),
            icon: GraduationCap,
            color: 'bg-purple-100 text-purple-600',
            subtext: null
        },
        {
            title: 'Live Classes Today',
            value: todayClassesCount.toString(),
            icon: Video,
            color: 'bg-red-100 text-red-600',
            subtext: null
        },
        {
            title: 'Pending Payments',
            value: (userCounts?.total || 0).toString(),
            icon: DollarSign,
            color: 'bg-yellow-100 text-yellow-600',
            customContent: (
                <div className="mt-2 text-xs space-y-1 text-gray-600">
                    <div className="flex justify-between">
                        <span>Total Students:</span>
                        <span className="font-semibold">{userCounts?.students || 0}</span>
                    </div>
                    {/* Real Data Logic */}
                    <div className="flex justify-between">
                        <span>Paid:</span>
                        <span className="font-semibold text-green-600">
                            {/* @ts-ignore - paidStudents added to service return */}
                            {userCounts?.paidStudents || 0}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Unpaid:</span>
                        <span className="font-semibold text-red-600">
                            {/* @ts-ignore - unpaidStudents added to service return */}
                            {userCounts?.unpaidStudents || 0}
                        </span>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview & Quick Actions</p>
                </div>
            </div>

            {/* Stats Cards - Simplified */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        {stat.customContent ? stat.customContent : (
                            <div className="h-4"></div> // Spacer to align heights roughly
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Upcoming Live Classes (Operational) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Today's Live Classes</h2>
                        <Link to="/admin/live-classes">
                            <Button variant="outline" size="sm">Manage Schedule</Button>
                        </Link>
                    </div>

                    {upcomingClasses.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingClasses.slice(0, 5).map((cls, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <Video className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{cls.title}</h4>
                                            <p className="text-sm text-gray-500">
                                                {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {cls.instructor}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls.status === 'live' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {cls.status === 'live' ? 'LIVE NOW' : 'Scheduled'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No classes scheduled for today.</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    {/* Recent Activity (Simplified) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {/* Placeholder Activity Logic - In real app, fetch from audit logs */}
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                <div>
                                    <p className="text-sm text-gray-800">New student registration</p>
                                    <p className="text-xs text-gray-500">10 mins ago</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                                <div>
                                    <p className="text-sm text-gray-800">Batch "JEE 2025" created</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/admin/students/new">
                                <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition-colors">
                                    <Users className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Add Student</span>
                                </button>
                            </Link>
                            <Link to="/admin/batches/new">
                                <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition-colors">
                                    <GraduationCap className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Create Batch</span>
                                </button>
                            </Link>
                            <Link to="/admin/live-classes/new">
                                <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition-colors">
                                    <Video className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Schedule Class</span>
                                </button>
                            </Link>
                            <Link to="/admin/tests/new">
                                <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-left transition-colors">
                                    <Plus className="w-5 h-5 mb-2" />
                                    <span className="text-sm font-medium">Create Test</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
