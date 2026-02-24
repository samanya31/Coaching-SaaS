import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExamGoal } from '@/contexts/ExamGoalContext';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: (data: { name: string; examGoal: string; language: string }) => void;
}

export const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
    const { availableGoals } = useExamGoal();
    const [step, setStep] = useState<'name' | 'goal' | 'language'>('name');
    const [name, setName] = useState('');
    const [examGoal, setExamGoal] = useState('');
    const [language, setLanguage] = useState('');

    const languages = [
        { id: 'Hinglish', label: 'Hinglish', icon: '→' },
        { id: 'English', label: 'English', icon: '→' },
        { id: 'Hindi', label: 'Hindi', icon: '→' },
    ];

    const handleNameContinue = () => {
        if (name.trim()) {
            setStep('goal');
        }
    };

    const handleGoalSelect = (goalId: string) => {
        setExamGoal(goalId);
        setStep('language');
    };

    const handleLanguageSelect = (langId: string) => {
        setLanguage(langId);
        // Complete onboarding
        onComplete({ name, examGoal, language: langId });
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
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    {step === 'name' && (
                        <div className="p-8">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 border-4 border-yellow-200 flex items-center justify-center">
                                    <div className="text-6xl">📱</div>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                                Enter your Name
                            </h2>

                            {/* Name Input */}
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your Name"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-lg mb-6"
                                autoFocus
                            />

                            {/* Continue Button */}
                            <button
                                onClick={handleNameContinue}
                                disabled={!name.trim()}
                                className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Continue
                            </button>

                            {/* Terms */}
                            <p className="mt-4 text-xs text-center text-gray-500">
                                By continuing you agree to our{' '}
                                <a href="#" className="text-indigo-600 hover:underline">
                                    Terms of use
                                </a>{' '}
                                &{' '}
                                <a href="#" className="text-indigo-600 hover:underline">
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    )}

                    {step === 'goal' && (
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => setStep('name')}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    ← Back
                                </button>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Select your Goal
                                </h2>
                                <div className="w-6"></div>
                            </div>

                            {/* Available Goals */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Exams</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableGoals.map((goal) => (
                                        <button
                                            key={goal.id}
                                            onClick={() => handleGoalSelect(goal.id)}
                                            className={`group relative p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 text-left ${examGoal === goal.id
                                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-xl shadow-sm transition-colors ${examGoal === goal.id ? 'bg-white' : 'bg-slate-100 group-hover:bg-white'}`}>
                                                <span className="text-2xl">{goal.icon}</span>
                                            </div>
                                            <div className={`font-bold ${examGoal === goal.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'}`}>{goal.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'language' && (
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => setStep('goal')}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    ← Back
                                </button>
                                <div className="w-6"></div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Create your learning journey
                            </h2>

                            <h3 className="text-lg font-medium text-gray-700 mb-6">
                                Which language do you prefer learning in?
                            </h3>

                            {/* Language Options */}
                            <div className="space-y-3 mb-8">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => handleLanguageSelect(lang.id)}
                                        className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between"
                                    >
                                        <span className="text-lg font-medium text-gray-900">{lang.label}</span>
                                        <span className="text-gray-400">{lang.icon}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Skip Button */}
                            <button className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium">
                                Skip
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
