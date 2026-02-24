import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Grid3x3, List, Eye, Edit2, Trash2, Video, Clock, Eye as EyeIcon, Calendar, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCourses, useDeleteCourse } from '@/hooks/data/useCourses';

const subjects = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'General', 'Reasoning'];

export const Content = () => {
    const { data: coursesData = [], isLoading } = useCourses();
    const { mutate: deleteCourse } = useDeleteCourse();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter courses
    const filteredCourses = coursesData.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSubject = selectedSubject === 'All' || course.category === selectedSubject;
        return matchesSearch && matchesSubject;
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this course?')) {
            deleteCourse(id);
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Course Library</h1>
                    <p className="text-gray-600 mt-1">Manage educational courses and content</p>
                </div>
                <Link to="/admin/dashboard/content/new">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Course
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Video className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Courses</p>
                            <p className="text-2xl font-bold text-gray-900">{coursesData.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <EyeIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Videos</p>
                            <p className="text-2xl font-bold text-gray-900">{coursesData.reduce((acc, c) => acc + c.total_videos, 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Duration</p>
                            <p className="text-2xl font-bold text-gray-900">{Math.round(coursesData.reduce((acc, c) => acc + (c.duration_hours || 0), 0))} hrs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & View Toggle */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 w-full md:w-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search videos, topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Subject Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                            >
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject === 'All' ? 'All Subjects' : subject}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Courses Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                            {/* Thumbnail */}
                            <div className="aspect-video relative bg-gray-100 overflow-hidden group">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Video className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all cursor-pointer">
                                        <PlayCircle className="w-6 h-6 text-indigo-600 fill-current" />
                                    </div>
                                </div>
                                {course.duration_hours && (
                                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        {course.duration_hours} hrs
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md ${course.status === 'published' ? 'bg-green-500/90 text-white' :
                                        course.status === 'draft' ? 'bg-yellow-500/90 text-white' :
                                            'bg-gray-500/90 text-white'
                                        }`}>
                                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {course.category || 'General'}
                                    </span>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Video className="w-3 h-3 mr-1" />
                                        {course.total_videos} videos
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description || 'No description'}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-gray-50">
                                    <Link to={`/admin/dashboard/content/${course.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam Goal</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stats</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                                                    {course.thumbnail_url ? (
                                                        <img
                                                            src={course.thumbnail_url}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Video className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                        <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                                                            <PlayCircle className="w-3 h-3 text-indigo-600 pl-0.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="min-w-0 max-w-xs">
                                                    <p className="font-semibold text-gray-900 line-clamp-1">{course.title}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{course.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {course.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${course.status === 'published' ? 'bg-green-100 text-green-700' :
                                                course.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {course.exam_goal || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Video className="w-3 h-3" /> {course.total_videos} videos
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" /> {course.duration_hours || 0} hrs
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/dashboard/content/${course.id}/edit`}>
                                                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(course.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
