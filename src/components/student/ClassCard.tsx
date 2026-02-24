import { motion } from 'framer-motion';
import { Clock, Play, Radio, Lock as LockIcon, CheckCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export interface ClassCardData {
    id: string;
    title: string;
    description?: string;
    subject?: string;
    instructor?: string;
    date: string;
    startTime?: string;
    duration?: string;
    type: 'live' | 'recorded' | 'upcoming';
    thumbnail?: string;
    videoUrl?: string;
    liveUrl?: string;
    isCompleted?: boolean;
}

interface ClassCardProps {
    classData: ClassCardData;
    onClick: () => void;
    index?: number;
}

export const ClassCard = ({ classData, onClick, index = 0 }: ClassCardProps) => {
    const getStatusIcon = () => {
        if (classData.isCompleted) {
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
        if (classData.type === 'live') {
            return <Radio className="w-5 h-5 text-red-500 animate-pulse" />;
        }
        if (classData.type === 'upcoming') {
            return <Radio className="w-5 h-5 text-red-500" />;
        }
        return <Play className="w-5 h-5 text-indigo-600" />;
    };

    const getStatusText = () => {
        if (classData.isCompleted) return 'Completed';
        if (classData.type === 'live') return 'Live Now';
        if (classData.type === 'upcoming') return 'Upcoming';
        return 'Watch Now';
    };

    const getStatusColor = () => {
        if (classData.isCompleted) return 'bg-gray-50 border-gray-200';
        if (classData.type === 'live') return 'bg-red-50/80 border-red-100 shadow-lg';
        if (classData.type === 'upcoming') return 'bg-red-50/80 border-red-100';
        return 'bg-white border-gray-200 hover:border-indigo-300';
    };

    const isClickable = classData.type === 'recorded' || classData.type === 'live';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={isClickable ? { x: 5 } : {}}
            onClick={isClickable ? onClick : undefined}
            className={`
        ${getStatusColor()}
        border rounded-xl p-4 transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-75'}
      `}
        >
            <div className="flex items-start gap-4">
                {/* Icon/Status */}
                <div className="flex-shrink-0 mt-1">
                    {getStatusIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {classData.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            {format(new Date(classData.date), 'MMM dd, yyyy')}
                        </span>
                        {(classData.type === 'live' || classData.type === 'upcoming') && classData.startTime && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-red-500" />
                                {classData.startTime}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                    {(classData.type === 'live' || classData.type === 'upcoming') && (() => {
                        const scheduledTime = new Date(classData.date).getTime();
                        const now = Date.now();
                        const hasStarted = now >= scheduledTime || classData.type === 'live';
                        return (
                            <button 
                                disabled={!hasStarted}
                                onClick={hasStarted ? onClick : undefined}
                                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                                    hasStarted 
                                        ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {!hasStarted && <LockIcon className="w-4 h-4" />}
                                {hasStarted ? 'Join Live' : 'Locked'}
                            </button>
                        );
                    })()}
                    {classData.type === 'recorded' && !classData.isCompleted && (
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                            Play
                        </button>
                    )}
                    {classData.isCompleted && (
                        <span className="text-xs text-green-600 bg-green-100 px-3 py-2 rounded-lg font-medium">
                            ✓ Done
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
