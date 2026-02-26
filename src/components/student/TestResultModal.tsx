import { XCircle, CheckCircle, X, Trophy, Clock, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface TestResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onViewAnalysis: () => void;
    result: {
        score: number;
        totalMarks: number;
        percentage: number;
        accuracy: number;
        timeTaken: number; // in seconds
        passed: boolean;
    };
}

export const TestResultModal = ({ isOpen, onClose, onViewAnalysis, result }: TestResultModalProps) => {
    const timeTakenMins = Math.floor(result.timeTaken / 60);
    const timeTakenSecs = result.timeTaken % 60;
    const timeDisplay = `${timeTakenMins}:${timeTakenSecs.toString().padStart(2, '0')}`;

    const passed = result.passed;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-0 bg-transparent border-0 shadow-none overflow-hidden">
                <div className="sr-only">
                    <DialogTitle>Test Result</DialogTitle>
                    <DialogDescription>{passed ? 'You passed the test.' : 'Keep practicing!'}</DialogDescription>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">

                    {/* Top Section with Icon */}
                    <div className={`relative px-8 pt-10 pb-8 text-center ${passed
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50'
                        : 'bg-gradient-to-br from-orange-50 to-amber-50'
                        }`}>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* Decorative circles */}
                        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white/30 -translate-x-12 -translate-y-12" />
                        <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-white/20 translate-x-8 translate-y-8" />

                        {/* Status Icon */}
                        <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 ${passed
                            ? 'bg-emerald-100 ring-4 ring-emerald-200/50'
                            : 'bg-orange-100 ring-4 ring-orange-200/50'
                            }`}>
                            {passed ? (
                                <CheckCircle className="w-10 h-10 text-emerald-600" strokeWidth={2} />
                            ) : (
                                <XCircle className="w-10 h-10 text-orange-500" strokeWidth={2} />
                            )}
                        </div>

                        {/* Title & Subtitle */}
                        <h2 className={`text-2xl font-bold mb-1 ${passed ? 'text-emerald-800' : 'text-orange-800'
                            }`}>
                            {passed ? 'Well Done!' : 'Keep Practicing!'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {passed ? 'You passed the test successfully' : 'You can do better next time'}
                        </p>

                        {/* Percentage Ring */}
                        <div className="mt-6 inline-flex flex-col items-center">
                            <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="42"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="50" cy="50" r="42"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${result.percentage * 2.64} 264`}
                                        className={passed ? 'text-emerald-500' : 'text-orange-400'}
                                        style={{
                                            transition: 'stroke-dasharray 1s ease-out',
                                        }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-xl font-bold ${passed ? 'text-emerald-700' : 'text-orange-600'
                                        }`}>
                                        {result.percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="px-6 py-6">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                                    <Trophy className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="text-lg font-bold text-gray-800">{result.score}/{result.totalMarks}</span>
                                <span className="text-[11px] text-gray-400 font-medium">Score</span>
                            </div>

                            <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
                                    <Target className="w-4 h-4 text-purple-500" />
                                </div>
                                <span className="text-lg font-bold text-gray-800">{result.accuracy.toFixed(0)}%</span>
                                <span className="text-[11px] text-gray-400 font-medium">Accuracy</span>
                            </div>

                            <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                </div>
                                <span className="text-lg font-bold text-gray-800">{timeDisplay}</span>
                                <span className="text-[11px] text-gray-400 font-medium">Time</span>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="px-6 pb-6 flex gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={onViewAnalysis}
                            className={`flex-1 h-12 rounded-xl font-semibold text-white shadow-lg ${passed
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                                }`}
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analysis
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
