import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTest } from '@/hooks/data/useTests';
import { useTestQuestions, useStartAttempt, useSubmitAttempt, useStudentAttempts } from '@/hooks/data/useTestQuestions';
import { useBatches } from '@/hooks/data/useBatches';
import { normalizeBatch } from '@/types/batch';
import { TestResultModal } from '@/components/student/TestResultModal';

export const TakeTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Prevent infinite loading if ID is missing (hooks would be disabled but isLoading remains true)
    if (!id) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Invalid Test URL</p>
                    <Button onClick={() => navigate('/student/dashboard/tests')} variant="outline" className="mt-4">Back to Tests</Button>
                </div>
            </div>
        );
    }

    const { data: test, isLoading: isTestLoading } = useTest(id);
    const { data: questions = [], isLoading: isQuestionsLoading } = useTestQuestions(id);
    const { data: rawBatches = [] } = useBatches();
    const { data: existingAttempts = [] } = useStudentAttempts(id);
    const startAttempt = useStartAttempt();
    const submitAttempt = useSubmitAttempt();

    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [testResult, setTestResult] = useState<{
        score: number;
        totalMarks: number;
        percentage: number;
        accuracy: number;
        timeTaken: number;
        passed: boolean;
        attemptId: string;
    } | null>(null);

    // Check for existing in-progress attempt on mount
    // Check for "in_progress" attempt ONLY. 
    // If a user has "submitted" attempts, we ignore them here so they can start a NEW one.
    useEffect(() => {
        if (existingAttempts.length > 0) {
            const inProgress = existingAttempts.find(a => a.status === 'in_progress');
            if (inProgress) {
                setAttemptId(inProgress.id);
                setHasStarted(true);
                // Restore answers if any
                if (inProgress.answers) {
                    setAnswers(inProgress.answers as Record<string, string>);
                }
            }
            // If only submitted attempts exist, we do NOTHING.
            // The user will see the "Start Test" screen, which is exactly what we want for a Retake.
        }
    }, [existingAttempts]);

    useEffect(() => {
        if (test && hasStarted) {
            setTimeLeft(test.duration * 60); // Convert to seconds

            // If resuming, adjust time left based on started_at
            // (Optional: for now we restart timer, but ideally we'd calc remaining time)
        }
    }, [test, hasStarted]);

    // Check Access
    useEffect(() => {
        if (isTestLoading || !test || !rawBatches.length) return;

        if (test.batch_id) {
            const batches = rawBatches.map(normalizeBatch);
            const enrolledBatchIds = new Set(batches.filter(b => b.isPurchased).map(b => b.id));

            if (!enrolledBatchIds.has(test.batch_id)) {
                alert('You are not enrolled in the batch required for this test.');
                navigate('/student/dashboard/tests');
            }
        }
    }, [test, rawBatches, isTestLoading, navigate]);

    useEffect(() => {
        if (!hasStarted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit(true); // Auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [hasStarted, timeLeft]);

    const handleStart = async () => {
        if (!test) return;

        try {
            const attempt = await startAttempt.mutateAsync({
                test_id: test.id,
                total_marks: test.total_marks
            });
            setAttemptId(attempt.id);
            setHasStarted(true);
        } catch (error) {
            console.error('Failed to start test:', error);
            alert('Failed to start test. Please try again.');
        }
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!attemptId || !test) return;

        const confirmed = autoSubmit || confirm('Are you sure you want to submit? You cannot change answers after submission.');
        if (!confirmed) return;

        try {
            const startTime = test.duration * 60;
            const timeTaken = startTime - timeLeft;

            const result = await submitAttempt.mutateAsync({
                attemptId,
                answers,
                timeTaken
            });

            // Calculate accuracy (same as percentage for now, or based on correct answers)
            const accuracy = result.total_marks > 0 
                ? ((result.score / result.total_marks) * 100) 
                : 0;

            // Show result modal immediately
            setTestResult({
                score: result.score || 0,
                totalMarks: result.total_marks || test.total_marks,
                percentage: result.percentage || 0,
                accuracy: accuracy,
                timeTaken: timeTaken,
                passed: result.score >= (test.passing_marks || 0),
                attemptId: result.id
            });
            setShowResultModal(true);
        } catch (error) {
            console.error('Failed to submit test:', error);
            alert('Failed to submit test. Please try again.');
        }
    };

    const handleViewAnalysis = () => {
        if (testResult) {
            setShowResultModal(false);
            navigate(`/student/dashboard/tests/${testResult.attemptId}/result`);
        }
    };

    const handleCloseModal = () => {
        setShowResultModal(false);
        navigate('/student/dashboard/tests');
    };

    const handleAnswerChange = (questionId: string, option: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // LOADING STATE
    if (isTestLoading || isQuestionsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading test data...</p>
                </div>
            </div>
        );
    }

    // ERROR STATE: Valid test but no ID or not found
    if (!test) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Test Not Found</h2>
                    <p className="text-gray-600 mb-6">The test you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => navigate('/student/dashboard/tests')} variant="outline">Back to Tests</Button>
                </div>
            </div>
        );
    }

    // EMPTY STATE: Test exists but has no questions (or RLS blocked them)
    if (questions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-amber-100 max-w-md">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Available</h2>
                    <p className="text-gray-600 mb-6">
                        This test currently has no questions added to it.
                        If you believe this is an error, please contact your instructor.
                    </p>
                    <Button onClick={() => navigate('/student/dashboard/tests')} variant="outline">Back to Tests</Button>
                </div>
            </div>
        );
    }

    if (!hasStarted) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{test.title}</h1>
                    {test.description && (
                        <p className="text-gray-600 mb-6">{test.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Questions</p>
                            <p className="text-2xl font-bold text-gray-900">{test.total_questions}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Marks</p>
                            <p className="text-2xl font-bold text-gray-900">{test.total_marks}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Duration</p>
                            <p className="text-2xl font-bold text-gray-900">{test.duration} mins</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Passing Marks</p>
                            <p className="text-2xl font-bold text-gray-900">{test.passing_marks}</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-900 mb-1">Instructions:</p>
                                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                                    <li>Once started, timer will begin automatically</li>
                                    <li>You can change answers anytime before submitting</li>
                                    <li>Test will auto-submit when time expires</li>
                                    <li>Make sure you have stable internet connection</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-6 text-lg"
                    >
                        Start Test
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Timer Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{test.title}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            <span className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">
                            {Object.keys(answers).length}/{questions.length} answered
                        </div>
                        <Button
                            onClick={() => handleSubmit(false)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Submit Test
                        </Button>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {questions.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium">
                                Q{index + 1}
                            </span>
                            <div className="flex-1">
                                <p className="text-gray-900 font-medium text-lg">{question.question_text}</p>
                                <p className="text-xs text-gray-500 mt-1">{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {['A', 'B', 'C', 'D'].map(option => {
                                const optionKey = `option_${option.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c' | 'option_d';
                                const isSelected = answers[question.id] === option;

                                return (
                                    <label
                                        key={option}
                                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={option}
                                            checked={isSelected}
                                            onChange={() => handleAnswerChange(question.id, option)}
                                            className="mt-1 w-4 h-4 text-indigo-600"
                                        />
                                        <span className="flex-1">
                                            <span className="font-medium text-gray-700">{option}.</span>{' '}
                                            <span className="text-gray-900">{question[optionKey]}</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Submit Button */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                        You have answered {Object.keys(answers).length} out of {questions.length} questions
                    </p>
                    <Button
                        onClick={() => handleSubmit(false)}
                        className="bg-green-600 hover:bg-green-700 px-8 py-3"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Submit Test
                    </Button>
                </div>
            </div>

            {/* Test Result Modal */}
            {testResult && (
                <TestResultModal
                    isOpen={showResultModal}
                    onClose={handleCloseModal}
                    onViewAnalysis={handleViewAnalysis}
                    result={testResult}
                />
            )}
        </div>
    );
};
