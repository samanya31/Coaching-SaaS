import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter } from 'lucide-react';
import { useBatches } from '@/hooks/data/useBatches';
import { BatchCard } from '@/components/student/BatchCard';
import { normalizeBatch } from '@/types/batch';

export const Batches = () => {
    const [selectedGoal, setSelectedGoal] = useState<string>('NEET');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: rawBatches = [] } = useBatches();
    // Normalize batches to ensure compatibility with UI components expecting camelCase
    const allBatches = useMemo(() => rawBatches.map(normalizeBatch), [rawBatches]);

    // Get selected exam goal from localStorage (set by ExamGoalSelector)
    useEffect(() => {
        const savedGoal = localStorage.getItem('selectedExamGoal');
        if (savedGoal) {
            setSelectedGoal(savedGoal);
        }
    }, []);

    // Filter batches when goal or search changes
    // We derive this during render to avoid useEffect synchronization loops
    const filteredBatches = useMemo(() => {
        let result = allBatches.filter((batch) =>
            batch.examGoal === selectedGoal ||
            batch.title?.includes(selectedGoal) ||
            batch.exam_goal === selectedGoal // fallback
        );

        if (searchQuery) {
            result = result.filter((batch) =>
                batch.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                batch.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return result;
    }, [allBatches, selectedGoal, searchQuery]);

    const examGoals = [
        'NEET',
        'JEE',
        'UPSC',
        'SSC',
        'Banking',
        'Foundation',
        'School Boards'
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            {/* Header */}
            <div className="relative text-white py-16 px-4 overflow-hidden rounded-2xl mx-4 mt-4">
                <img
                    src="/src/assets/batch.png"
                    alt="Batches"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-8 h-8" />
                            <h1 className="text-3xl font-bold">Explore Batches</h1>
                        </div>
                        <p className="text-white/80">
                            Find the perfect course for your exam preparation
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-4 mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search batches by name, instructor, or topic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </motion.div>

                {/* Exam Goal Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Filter by Exam:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {examGoals.map((goal) => (
                            <button
                                key={goal}
                                onClick={() => setSelectedGoal(goal)}
                                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${selectedGoal === goal
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                    }
                `}
                            >
                                {goal}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-600">
                    Found <span className="font-semibold text-gray-900">{filteredBatches.length}</span> batches for {selectedGoal}
                </div>

                {/* Batches Grid */}
                {filteredBatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {filteredBatches.map((batch, index) => (
                            <BatchCard key={batch.id} batch={batch} index={index} />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No batches found
                        </h3>
                        <p className="text-gray-600">
                            Try searching with different keywords or select another exam goal
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
