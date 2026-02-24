import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExamGoal } from '@/contexts/ExamGoalContext';

interface ExamGoalSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (goalId: string) => void;
    currentGoal?: string;
}

export const ExamGoalSelectorModal = ({ isOpen, onClose, onSelect, currentGoal }: ExamGoalSelectorModalProps) => {
    const { availableGoals } = useExamGoal();

    const handleSelect = (goalId: string) => {
        onSelect(goalId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-8">
                        {/* Header */}
                        <div className="relative flex items-center justify-center mb-8">
                            <button
                                onClick={onClose}
                                className="absolute left-0 text-gray-500 hover:text-gray-900 flex items-center gap-1"
                            >
                                <span>←</span> Back
                            </button>
                            <h2 className="text-xl font-bold text-slate-900">
                                Select your Goal
                            </h2>
                        </div>

                        {/* Available Goals */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-600 mb-4">Popular Exams</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableGoals.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => handleSelect(goal.id)}
                                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 text-left ${currentGoal === goal.id
                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                            : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl shadow-sm ${currentGoal === goal.id ? 'bg-white' : 'bg-slate-100 group-hover:bg-white'} transition-colors`}>
                                            <span className="text-2xl">{goal.icon}</span>
                                        </div>
                                        <div>
                                            <div className={`font-bold ${currentGoal === goal.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'}`}>{goal.name}</div>
                                            {/* Optional: Add a subtle subtitle if available, or keep it clean */}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Button component for selecting exam goal
interface ExamGoalButtonProps {
    currentGoal: string;
    icon?: string;
    onClick: () => void;
}

export const ExamGoalButton = ({ currentGoal, icon, onClick }: ExamGoalButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-indigo-500 hover:shadow-md transition-all"
        >
            <span className="text-lg">{icon || '🎯'}</span>
            <span className="font-medium text-gray-900">{currentGoal}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
    );
};
