import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Power, ImageIcon, Globe, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBanners, useDeleteBanner, useToggleBannerStatus } from '@/hooks/data/useBanners';
import type { BannerType, BannerAudience } from '@/types/banner';

const bannerTypes: { value: string; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'public_website', label: 'Public Website' },
    { value: 'student_dashboard', label: 'Student Dashboard' }
];

const targetAudiences: { value: string; label: string }[] = [
    { value: 'all', label: 'All Audiences' },
    { value: 'jee', label: 'JEE' },
    { value: 'neet', label: 'NEET' },
    { value: 'upsc', label: 'UPSC' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'ssc', label: 'SSC' },
    { value: 'banking', label: 'Banking' }
];

export const Website = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedAudience, setSelectedAudience] = useState('all');

    const { data: banners = [], isLoading } = useBanners();
    const { mutate: deleteBanner } = useDeleteBanner();
    const { mutate: toggleStatus } = useToggleBannerStatus();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading banners...</p>
                </div>
            </div>
        );
    }

    // Filter banners
    const filteredBanners = banners.filter(banner => {
        const matchesSearch = (banner.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (banner.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || banner.type === selectedType;
        const matchesAudience = selectedAudience === 'all' || banner.target_audience === selectedAudience;
        return matchesSearch && matchesType && matchesAudience;
    });

    const handleDelete = (id: string, title: string | null) => {
        if (confirm(`Are you sure you want to delete banner "${title || 'Untitled'}"?`)) {
            deleteBanner(id);
        }
    };

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        toggleStatus({ bannerId: id, isActive: !currentStatus });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Website Manager</h1>
                    <p className="text-gray-600 mt-1">Manage homepage banners and promotional content</p>
                </div>
                <Link to="/admin/dashboard/website/new">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Banner
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 rounded-lg">
                            <Globe className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Banners</p>
                            <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Power className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active</p>
                            <p className="text-2xl font-bold text-gray-900">{banners.filter(b => b.is_active).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Globe className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Public Website</p>
                            <p className="text-2xl font-bold text-gray-900">{banners.filter(b => b.type === 'public_website').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <ImageIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Student Dashboard</p>
                            <p className="text-2xl font-bold text-gray-900">{banners.filter(b => b.type === 'student_dashboard').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search banners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                        >
                            {bannerTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Audience Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={selectedAudience}
                            onChange={(e) => setSelectedAudience(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                        >
                            {targetAudiences.map(aud => (
                                <option key={aud.value} value={aud.value}>{aud.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Banners Grid */}
            {filteredBanners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBanners.map((banner) => (
                        <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                            {/* Banner Image */}
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={banner.image_url}
                                    alt={banner.title || 'Banner'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=No+Image';
                                    }}
                                />
                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {banner.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Banner Info */}
                            <div className="p-4">
                                <div className="mb-3">
                                    <h3 className="font-semibold text-gray-900 line-clamp-1 text-base mb-1">
                                        {banner.title || 'Untitled Banner'}
                                    </h3>
                                    {banner.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                            {banner.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                            {banner.type === 'public_website' ? 'Public' : 'Dashboard'}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">
                                            {banner.target_audience.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Order: {banner.display_order}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`text-xs ${banner.is_active ? 'text-gray-600 hover:text-gray-800' : 'text-green-600 hover:text-green-700'}`}
                                        onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                                    >
                                        <Power className="w-3.5 h-3.5 mr-1" />
                                        {banner.is_active ? 'Hide' : 'Show'}
                                    </Button>
                                    <Link to={`/admin/dashboard/website/${banner.id}/edit`}>
                                        <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700 w-full">
                                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-red-600 hover:text-red-700"
                                        onClick={() => handleDelete(banner.id, banner.title)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No banners found matching your filters.</p>
                    <Link to="/admin/dashboard/website/new">
                        <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Banner
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};
