import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Calendar, IndianRupee } from 'lucide-react';
import { Batch } from '@/types/batch';

interface BatchCardProps {
    batch: Batch;
    index?: number;
}

export const BatchCard = ({ batch, index = 0 }: BatchCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group"
        >
            <Link to={`/student/dashboard/batch/${batch.id}`} className="block">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                        {batch.thumbnail_url || batch.thumbnail ? (
                            <img
                                src={batch.thumbnail_url || batch.thumbnail}
                                alt={batch.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                {batch.instructorAvatar}
                            </div>
                        )}

                        {/* Purchased Badge */}
                        {batch.isPurchased && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ✓ Enrolled
                            </div>
                        )}

                        {/* Exam Goal Tag */}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-indigo-600">
                            {batch.examGoal}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        {/* Title & Instructor */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {batch.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-1">
                            by <span className="font-medium">{batch.instructor}</span>
                        </p>

                        {/* Description */}
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                            {batch.description}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{batch.duration}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{batch.totalClasses} classes</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>{batch.students.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{batch.rating}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {batch.tags.slice(0, 3).map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            {batch.isPurchased ? (
                                <>
                                    <span className="text-sm font-medium text-green-600">
                                        ✓ Enrolled
                                    </span>
                                    <span className="text-sm font-semibold text-indigo-600">
                                        View Classes →
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-1">
                                        <IndianRupee className="w-5 h-5 text-gray-700" />
                                        <span className="text-2xl font-bold text-gray-900">
                                            {batch.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-amber-600">
                                        Enroll Now →
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
