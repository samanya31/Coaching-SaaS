import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useExamGoal } from '@/contexts/ExamGoalContext';
import { Button } from '@/components/ui/button';

interface ExamGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ExamGoalModal = ({ isOpen, onClose }: ExamGoalModalProps) => {
    const { selectedGoal, availableGoals, setSelectedGoal } = useExamGoal();

    const handleSelectGoal = (goalId: string) => {
        const goal = availableGoals.find(g => g.id === goalId);
        if (goal) {
            setSelectedGoal(goal);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#1E3A8A]">
                                Change Your Exam Goal
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="p-6">
                            {/* Currently Selected */}
                            {selectedGoal && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-[#6B7280] mb-3">Current Goal</h3>
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-[#1E3A8A] rounded-2xl">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${selectedGoal.color} flex items-center justify-center text-2xl`}>
                                            {selectedGoal.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-[#1E3A8A]">{selectedGoal.name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* All Goals */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-[#6B7280] mb-3">Popular Exams</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {availableGoals
                                        .filter(goal => goal.id !== selectedGoal?.id)
                                        .map((goal) => (
                                            <button
                                                key={goal.id}
                                                onClick={() => handleSelectGoal(goal.id)}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${selectedGoal?.id === goal.id
                                                    ? 'border-[#1E3A8A] bg-blue-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${goal.color} flex items-center justify-center text-xl`}>
                                                    {goal.icon}
                                                </div>
                                                <span className="font-semibold text-[#1E3A8A] text-sm text-left">{goal.name}</span>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
