import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileQuestion, Trophy, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTests } from '@/hooks/data/useTests';
import { useBatches } from '@/hooks/data/useBatches';
import { useAllStudentAttempts } from '@/hooks/data/useTestQuestions';
import { normalizeBatch } from '@/types/batch';
import { format } from 'date-fns';

export const StudentTests = () => {
    const navigate = useNavigate();

    // Fetch Data
    const { data: allTests = [], isLoading: testsLoading } = useTests({ status: 'published' });
    const { data: rawBatches = [], isLoading: batchesLoading } = useBatches();
    const { data: attempts = [], isLoading: attemptsLoading } = useAllStudentAttempts();

    const isLoading = testsLoading || batchesLoading || attemptsLoading;

    // Process Batches
    const enrolledBatchIds = useMemo(() => {
        const batches = rawBatches.map(normalizeBatch);
        return new Set(batches.filter(b => b.isPurchased).map(b => b.id));
    }, [rawBatches]);

    // Process Tests
    const { availableTests, completedTests } = useMemo(() => {
        // 1. Filter tests relevant to student
        const relevantTests = allTests.filter(test => {
            // If test is batch-specific, student must be enrolled
            if (test.batch_id) {
                return enrolledBatchIds.has(test.batch_id);
            }
            // If test is general (batch_id is null), show it
            // (Optional: You could also filter by exam_goal if needed, but usually general tests are open)
            return true;
        });

        const available: typeof allTests = [];
        const completed: any[] = [];

        relevantTests.forEach(test => {
            // Check if student has attempted this specific test
            // We use the most recent attempt if multiple exist (though usually 1 attempt per test unless retakes allowed)
            const studentAttempt = attempts.find(a => a.test_id === test.id);

            if (studentAttempt) {
                completed.push({
                    ...test,
                    attempt: studentAttempt
                });
            } else {
                available.push(test);
            }
        });

        return { availableTests: available, completedTests: completed };
    }, [allTests, enrolledBatchIds, attempts]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-600 bg-green-50';
            case 'medium': return 'text-amber-600 bg-amber-50';
            case 'hard': return 'text-red-600 bg-red-50';
            default: return 'text-stone-600 bg-stone-50';
        }
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return 'Flexible';
        try {
            return format(new Date(dateStr), 'MMM dd, yyyy');
        } catch {
            return dateStr;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-gray-500">Loading your tests...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 md:pb-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Test Series</h1>
                <p className="text-[#6B7280]">Practice tests and track your performance</p>
            </div>

            {/* Available Tests */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-[#1E3A8A]">Available Tests ({availableTests.length})</h2>
                    <div className="h-px flex-1 bg-gray-200"></div>
                </div>

                {availableTests.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                        <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900">No new tests available</h3>
                        <p className="text-gray-500 text-sm mt-1">You're all caught up! Check back later or review your completed tests.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableTests.map((test) => (
                            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 mr-2">
                                        <h3 className="text-sm sm:text-base font-bold text-[#1E3A8A] mb-1 leading-tight line-clamp-2">{test.title}</h3>
                                        <div className="flex gap-1.5 text-xs sm:text-sm">
                                            <span className="capitalize text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded">{test.type}</span>
                                            {test.subject && <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{test.subject}</span>}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold capitalize whitespace-nowrap ${getDifficultyColor(test.difficulty)}`}>
                                        {test.difficulty}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-3 text-xs sm:text-sm text-[#6B7280]">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                                        <span>{test.duration} mins</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <FileQuestion className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                                        <span>{test.total_questions} Qs</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                                        <span>{test.total_marks} Marks</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                                        <span>{formatDate(test.scheduled_date)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => navigate(`/student/dashboard/tests/${test.id}/take`)}
                                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg shadow-sm h-8 sm:h-10 text-xs sm:text-sm"
                                >
                                    Start Test
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Tests */}
            {completedTests.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-4 mt-8">
                        <h2 className="text-xl font-bold text-[#1E3A8A]">Previous Attempts ({completedTests.length})</h2>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {completedTests.map((test) => {
                            const attempt = test.attempt;
                            const percentage = attempt.percentage || 0;
                            const isPassed = percentage >= ((test.passing_marks / test.total_marks) * 100);

                            return (
                                <div key={test.id} className="bg-white rounded-xl shadow-sm border border-stone-200 p-3 flex flex-col">
                                    <div className="flex flex-col gap-1.5 mb-2">
                                        <h3 className="text-sm sm:text-base font-bold text-[#1E3A8A] line-clamp-1 leading-tight">{test.title}</h3>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {attempt.status === 'in_progress' && (
                                                <span className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium">In Progress</span>
                                            )}
                                            {attempt.status === 'submitted' && (
                                                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {isPassed ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                    {isPassed ? 'Passed' : 'Needs Improvement'}
                                                </span>
                                            )}
                                            <span className="text-[10px] sm:text-xs text-[#6B7280]">
                                                {formatDate(attempt.submitted_at || attempt.updated_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {attempt.status === 'submitted' && (
                                        <div className="flex items-center justify-around bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 mb-2">
                                            <div className="text-center">
                                                <div className="text-base sm:text-xl font-bold text-[#1E3A8A]">
                                                    {attempt.score}<span className="text-xs sm:text-sm text-gray-400 font-normal">/{test.total_marks}</span>
                                                </div>
                                                <div className="text-[9px] sm:text-xs text-[#6B7280] font-medium uppercase tracking-wide">Score</div>
                                            </div>
                                            <div className="w-px h-6 bg-gray-200" />
                                            <div className="text-center">
                                                <div className={`text-base sm:text-xl font-bold ${percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {Math.round(percentage)}%
                                                </div>
                                                <div className="text-[9px] sm:text-xs text-[#6B7280] font-medium uppercase tracking-wide">Percentage</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-auto">
                                        {attempt.status === 'submitted' ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => navigate(`/student/dashboard/tests/${attempt.id}/result`)}
                                                    className="flex-1 border-2 border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg text-xs sm:text-sm h-8 sm:h-10"
                                                >
                                                    Analysis
                                                </Button>
                                                <a
                                                    href={`/student/dashboard/tests/${test.id}/take`}
                                                    className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium px-3 h-8 sm:h-10 text-xs sm:text-sm transition-all shadow-sm"
                                                >
                                                    Retake
                                                </a>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={() => navigate(`/student/dashboard/tests/${test.id}/take`)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 sm:h-10 text-xs sm:text-sm"
                                            >
                                                Resume Test
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
