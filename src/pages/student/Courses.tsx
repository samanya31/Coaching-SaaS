import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { useBatches } from '@/hooks/data/useBatches';
import { BatchCard } from '@/components/student/BatchCard';
import { normalizeBatch } from '@/types/batch';
import coursesHero from '@/assets/courses.png';

export const StudentCourses = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: rawBatches = [] } = useBatches();
    const allBatches = rawBatches.map(normalizeBatch);

    // Filter for purchased batches and search query
    const purchasedBatches = allBatches.filter(batch => {
        if (!batch.isPurchased) return false;
        if (searchQuery) {
            return batch.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                batch.description?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Header */}
            <div className="relative text-white py-8 px-4 overflow-hidden rounded-2xl mx-2 mt-2">
                <img
                    src={coursesHero}
                    alt="My Courses"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-6 h-6" />
                        <h1 className="text-xl font-bold">My Courses</h1>
                    </div>
                    <p className="text-white/80 text-sm">Continue learning from where you left off</p>
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
                            placeholder="Search your courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {purchasedBatches.length > 0 ? (
                    <>
                        <div className="mb-4 text-sm text-gray-600">
                            You are enrolled in <span className="font-semibold text-gray-900">{purchasedBatches.length}</span> {purchasedBatches.length === 1 ? 'batch' : 'batches'}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {purchasedBatches.map((batch, index) => (
                                <BatchCard key={batch.id} batch={batch} index={index} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No courses yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Browse available batches and enroll to start learning
                        </p>
                        <a
                            href="/student/dashboard/batches"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Browse Batches
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
