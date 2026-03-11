
import { useState } from 'react';
import { Search, Filter, Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTests, type TestType, type TestStatus } from '@/hooks/data/useTests';
import { usePlanFeatures } from '@/hooks/data/usePlan';
import { useTenant } from '@/app/providers/TenantProvider';
import { Lock } from 'lucide-react';

const getTypeColor = (type: TestType) => {
    switch (type) {
        case 'mock':
            return 'bg-purple-100 text-purple-700';
        case 'practice':
            return 'bg-blue-100 text-blue-700';
        case 'live':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const getStatusColor = (status: TestStatus) => {
    switch (status) {
        case 'published':
            return 'bg-green-100 text-green-700';
        case 'draft':
            return 'bg-amber-100 text-amber-700';
        case 'archived':
            return 'bg-gray-100 text-gray-600';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

export const Tests = () => {
    const { data: tests = [], isLoading } = useTests();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<TestType | 'all'>('all');

    // Filter tests
    const filteredTests = tests.filter(test => {
        const matchesSearch =
            test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.subject.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || test.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const { coachingId } = useTenant();
    const { canUseTests, isLoading: isPlanLoading } = usePlanFeatures(coachingId);

    if (isLoading || isPlanLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!canUseTests) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tests are Locked</h2>
                <p className="text-gray-600 max-w-sm mb-8">
                    Mock tests, practice sets, and live quizzes are available on the **Advanced** and **Pro** plans. Upgrade to start assessing your students.
                </p>
                <Link to="/admin/dashboard/settings/plans">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8">
                        View Upgrade Options
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
                    <p className="text-gray-600 mt-1">Create and manage mock tests, practice sets, and live quizzes</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/dashboard/tests/new">
                        <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4" />
                            Create New Test
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Total Tests</h3>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Across all categories</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Published</h3>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {tests.filter(t => t.status === 'published').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Active for students</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Upcoming Live Tests</h3>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <Clock className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {tests.filter(t => t.type === 'live' && t.status === 'published').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Scheduled events</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tests by title or subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as TestType | 'all')}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                            >
                                <option value="all">All Types</option>
                                <option value="mock">Mock Test</option>
                                <option value="practice">Practice Set</option>
                                <option value="live">Live Quiz</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tests List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Test Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type & Goal</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTests.map((test) => (
                                <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg mt-1">
                                                <FileText className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{test.title}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{test.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex self-start px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(test.type)}`}>
                                                {test.type.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">
                                                For {test.exam_goal}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700">{test.subject}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <p>Marks: <span className="font-medium">{test.total_marks}</span></p>
                                            <p>Ques: <span className="font-medium">{test.total_questions}</span></p>
                                            <p>Time: <span className="font-medium">{test.duration}m</span></p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                                            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/admin/dashboard/tests/${test.id}/edit`}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredTests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No tests found matching your criteria.
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
