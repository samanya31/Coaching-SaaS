import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Search, Filter, Megaphone, AlertCircle, CheckCircle, Info, Edit2, Trash2, Globe, Target, Layers, Pin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnnouncements, useDeleteAnnouncement, useTogglePin } from '@/hooks/data/useAnnouncements';
import { useBatches } from '@/hooks/data/useBatches'; // Assuming this exists
import { Announcement } from '@/services/api/announcement.service';

type TargetType = 'all' | 'exam_goal' | 'batch';

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
        case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
    }
};

const getTargetIcon = (targetType: TargetType) => {
    switch (targetType) {
        case 'all': return <Globe className="w-4 h-4 text-gray-500" />;
        case 'exam_goal': return <Target className="w-4 h-4 text-indigo-500" />;
        case 'batch': return <Layers className="w-4 h-4 text-purple-500" />;
    }
};

export const Announcements = () => {
    // Fetch data
    const { data: dbAnnouncements = [], isLoading: isLoadingAnnouncements } = useAnnouncements();
    const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
    const deleteAnnouncement = useDeleteAnnouncement();
    const togglePin = useTogglePin();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<TargetType | 'any'>('any');

    // Map DB data to UI format
    const announcementsList = dbAnnouncements.map(item => {
        let targetType: TargetType = 'all';
        let targetValue = '';

        if (item.target_batches?.length) {
            targetType = 'batch';
            targetValue = item.target_batches[0];
        } else if (item.target_exam_goals?.length) {
            targetType = 'exam_goal';
            targetValue = item.target_exam_goals[0];
        }

        return {
            ...item,
            message: item.content,
            postedAt: new Date(item.created_at),
            targetType,
            targetValue
        };
    });

    const getTargetLabel = (targetType: TargetType, targetValue: string) => {
        if (targetType === 'all') return 'Global';
        if (targetType === 'exam_goal') return `Goal: ${targetValue}`;
        if (targetType === 'batch') {
            const batch = batches.find(b => b.id === targetValue);
            return batch ? `Batch: ${batch.name}` : `Batch ID: ${targetValue}`;
        }
        return 'Unknown';
    };

    // Filter announcements
    const filteredAnnouncements = announcementsList.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'any' || item.targetType === filterType;
        return matchesSearch && matchesType;
    });

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            await deleteAnnouncement.mutateAsync(id);
        }
    };

    const handleTogglePin = async (id: string, currentStatus: boolean) => {
        await togglePin.mutateAsync({ announcementId: id, isPinned: !currentStatus });
    };

    if (isLoadingAnnouncements || isLoadingBatches) {
        return <div className="text-center py-12">Loading announcements...</div>;
    }

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-600 mt-1">Manage global and targeted notifications</p>
                </div>
                <Link to="/admin/dashboard/announcements/new">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Announcement
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search announcements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as TargetType | 'any')}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                            >
                                <option value="any">All Types</option>
                                <option value="all">Global</option>
                                <option value="exam_goal">Exam Goal</option>
                                <option value="batch">Batch Specific</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Announcement</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Posted At</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pinned</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAnnouncements.map((announcement) => (
                                <tr key={announcement.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">{getTypeIcon(announcement.type)}</div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{announcement.title}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1">{announcement.message}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            {getTargetIcon(announcement.targetType)}
                                            <span>{getTargetLabel(announcement.targetType, announcement.targetValue)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {announcement.postedAt.toLocaleDateString()} {announcement.postedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleTogglePin(announcement.id, announcement.is_pinned)}
                                            className={`p-1 rounded-full text-xs font-medium transition-colors ${announcement.is_pinned
                                                ? 'text-indigo-600 bg-indigo-50'
                                                : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            <Pin className={`w-4 h-4 ${announcement.is_pinned ? 'fill-current' : ''}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/dashboard/announcements/${announcement.id}/edit`}>
                                                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(announcement.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAnnouncements.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No announcements found matching your criteria.
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
