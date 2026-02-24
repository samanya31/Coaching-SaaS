import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExamGoal } from '@/contexts/ExamGoalContext';
import { Button } from '@/components/ui/button';

export const ExamGoalSelector = () => {
    const { selectedGoal, availableGoals, setSelectedGoal } = useExamGoal();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 hover:border-[#1E3A8A] rounded-xl transition-all"
            >
                <span className="text-xl">{selectedGoal.icon}</span>
                <span className="font-semibold text-[#1E3A8A] hidden sm:inline">{selectedGoal.name}</span>
                <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                                <h3 className="font-semibold text-[#1E3A8A] text-sm">Choose Your Exam Goal</h3>
                            </div>

                            {/* Goals List */}
                            <div className="max-h-96 overflow-y-auto p-2">
                                {availableGoals.map((goal) => {
                                    const isSelected = selectedGoal.id === goal.id;
                                    return (
                                        <button
                                            key={goal.id}
                                            onClick={() => {
                                                setSelectedGoal(goal);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSelected
                                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-[#1E3A8A]'
                                                    : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${goal.color} flex items-center justify-center text-xl`}>
                                                {goal.icon}
                                            </div>
                                            <span className={`flex-1 text-left font-medium ${isSelected ? 'text-[#1E3A8A]' : 'text-[#6B7280]'
                                                }`}>
                                                {goal.name}
                                            </span>
                                            {isSelected && (
                                                <Check className="w-5 h-5 text-[#1E3A8A]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
