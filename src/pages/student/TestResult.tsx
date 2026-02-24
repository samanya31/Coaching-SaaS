import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Award, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAttempt } from '@/hooks/data/useTestQuestions';
import { useTest } from '@/hooks/data/useTests';
import { useTestQuestions } from '@/hooks/data/useTestQuestions';

export const TestResult = () => {
    const { id } = useParams();
    const attemptId = id; // Route param is 'id', but we call it attemptId here
    const navigate = useNavigate();

    const { data: attempt, isLoading: isAttemptLoading } = useAttempt(attemptId);
    const { data: test, isLoading: isTestLoading } = useTest(attempt?.test_id);
    const { data: questions = [] } = useTestQuestions(attempt?.test_id);

    // LOADING STATE
    if (isAttemptLoading || isTestLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading results...</p>
                </div>
            </div>
        );
    }

    // ERROR STATE
    if (!attempt || !test) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Result Unavailable</h2>
                    <p className="text-gray-600 mb-6">The test result you are looking for could not be found.</p>
                    <Link to="/student/dashboard/tests">
                        <Button variant="outline">Back to Tests</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const passed = attempt.score >= test.passing_marks;
    const accuracy = ((attempt.score / attempt.total_marks) * 100).toFixed(1);
    const timeTakenMins = attempt.time_taken ? Math.floor(attempt.time_taken / 60) : 0;
    const timeTakenSecs = attempt.time_taken ? attempt.time_taken % 60 : 0;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Result Card */}
            <div className={`bg-gradient-to-r ${passed ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600'} rounded-2xl shadow-lg p-8 text-white`}>
                <div className="text-center">
                    {passed ? (
                        <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                    ) : (
                        <XCircle className="w-20 h-20 mx-auto mb-4" />
                    )}
                    <h1 className="text-4xl font-bold mb-2">
                        {passed ? 'Congratulations!' : 'Keep Practicing!'}
                    </h1>
                    <p className="text-xl opacity-90">
                        {passed ? 'You have passed the test!' : 'You can do better next time!'}
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-6 mt-8">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                        <p className="text-sm opacity-90 mb-1">Score</p>
                        <p className="text-3xl font-bold">{attempt.score}/{attempt.total_marks}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                        <p className="text-sm opacity-90 mb-1">Percentage</p>
                        <p className="text-3xl font-bold">{attempt.percentage.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                        <p className="text-sm opacity-90 mb-1">Accuracy</p>
                        <p className="text-3xl font-bold">{accuracy}%</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                        <p className="text-sm opacity-90 mb-1">Time Taken</p>
                        <p className="text-3xl font-bold">{timeTakenMins}:{timeTakenSecs.toString().padStart(2, '0')}</p>
                    </div>
                </div>
            </div>

            {/* Test Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{test.title}</h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Total Questions</p>
                        <p className="font-semibold text-gray-900">{test.total_questions}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Passing Marks</p>
                        <p className="font-semibold text-gray-900">{test.passing_marks}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Difficulty</p>
                        <p className="font-semibold text-gray-900 capitalize">{test.difficulty}</p>
                    </div>
                </div>
            </div>

            {/* Question-wise Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Question-wise Analysis
                </h2>

                <div className="space-y-4">
                    {questions.map((question, index) => {
                        const studentAnswer = attempt.answers[question.id];
                        const isCorrect = studentAnswer === question.correct_option;

                        return (
                            <div key={question.id} className={`border-2 rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex items-start gap-3 mb-3">
                                    {isCorrect ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-white px-2 py-0.5 rounded text-sm font-medium">Q{index + 1}</span>
                                            <span className="text-xs text-gray-600">{question.marks} {question.marks === 1 ? 'mark' : 'marks'}</span>
                                        </div>
                                        <p className="font-medium text-gray-900">{question.question_text}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {['A', 'B', 'C', 'D'].map(option => {
                                        const optionKey = `option_${option.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c' | 'option_d';
                                        const isCorrectOption = option === question.correct_option;
                                        const isStudentAnswer = option === studentAnswer;

                                        let bgColor = 'bg-white';
                                        let borderColor = 'border-gray-200';

                                        if (isCorrectOption) {
                                            bgColor = 'bg-green-100';
                                            borderColor = 'border-green-500';
                                        } else if (isStudentAnswer && !isCorrect) {
                                            bgColor = 'bg-red-100';
                                            borderColor = 'border-red-500';
                                        }

                                        return (
                                            <div key={option} className={`p-2 rounded border-2 ${bgColor} ${borderColor} text-sm`}>
                                                <span className="font-medium">{option}.</span> {question[optionKey]}
                                                {isCorrectOption && <span className="ml-2 text-green-700 font-medium">✓ Correct</span>}
                                                {isStudentAnswer && !isCorrect && <span className="ml-2 text-red-700 font-medium">✗ Your answer</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {question.explanation && (
                                    <div className="bg-white rounded border border-gray-200 p-3 text-sm">
                                        <p className="font-medium text-gray-700 mb-1">Explanation:</p>
                                        <p className="text-gray-600">{question.explanation}</p>
                                    </div>
                                )}

                                {!studentAnswer && (
                                    <p className="text-sm text-amber-700 font-medium">⚠ Not attempted</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Link to="/student/dashboard/tests" className="flex-1">
                    <Button variant="outline" className="w-full">
                        <Home className="w-4 h-4 mr-2" />
                        Back to Tests
                    </Button>
                </Link>
            </div>
        </div>
    );
};
