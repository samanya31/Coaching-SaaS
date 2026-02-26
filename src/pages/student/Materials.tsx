import { useState } from 'react';
import { FileText, Download, FolderOpen, Video, File, Search } from 'lucide-react';
import { useAllStudentStudyMaterials } from '@/hooks/data/useStudyMaterials';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const StudentMaterials = () => {
    const { data: materials = [], isLoading, isError: matchesError } = useAllStudentStudyMaterials();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');

    const getFileIcon = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('pdf')) return <FileText className="w-6 h-6 text-white" />;
        if (lowerType.includes('video') || lowerType.includes('mp4')) return <Video className="w-6 h-6 text-white" />;
        return <File className="w-6 h-6 text-white" />;
    };

    const getCategoryColor = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('pdf')) return 'from-blue-500 to-blue-600';
        if (lowerType.includes('video')) return 'from-red-500 to-red-600';
        return 'from-emerald-500 to-emerald-600';
    };

    // Filter materials
    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.batch?.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || material.file_type.toLowerCase().includes(selectedType);
        return matchesSearch && matchesType;
    });

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (matchesError) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
                    <p>Failed to load materials. Please try refreshing.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Current Affairs & Materials</h1>
                    <p className="text-[#6B7280]">Access daily current affairs and resources from your enrolled batches</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 sticky top-0 z-10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2 bg-stone-100 p-1 rounded-lg">
                        {['all', 'pdf', 'video'].map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedType === type
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-700'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Materials Grid */}
            {filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredMaterials.map((material, index) => (
                        <motion.div
                            key={material.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-start gap-3 mb-2">
                                {/* File Icon */}
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${getCategoryColor(material.file_type)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    {getFileIcon(material.file_type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm sm:text-base font-bold text-[#1E3A8A] mb-0.5 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                        {material.title}
                                    </h3>
                                    <p className={`text-[10px] sm:text-xs inline-block px-1.5 py-0.5 rounded-full line-clamp-1 ${material.is_public ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-[#6B7280]'}`}>
                                        {material.is_public ? 'Current Affairs' : (material.batch?.title || 'General Resource')}
                                    </p>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#6B7280] mb-2 px-1">
                                <span>{new Date(material.created_at).toLocaleDateString()}</span>
                                <span className="uppercase">{material.file_type}</span>
                            </div>

                            {/* Description (Optional) */}
                            {material.description && (
                                <p className="text-xs sm:text-sm text-stone-500 mb-2 line-clamp-2">
                                    {material.description}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-auto">
                                <a
                                    href={material.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg gap-1.5 shadow-sm text-xs sm:text-sm h-8 sm:h-10">
                                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Download / View
                                    </Button>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-200">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-stone-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No materials found</h3>
                    <p className="text-gray-500">
                        {searchQuery ? 'Try adjusting your search filters' : 'Materials will appear here once uploaded to your batches'}
                    </p>
                </div>
            )}
        </div>
    );
};
