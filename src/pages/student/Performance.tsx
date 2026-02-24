import { TrendingUp, Award, Clock, CheckCircle, BarChart2, Calendar } from 'lucide-react';
import { useAllStudentAttempts } from '@/hooks/data/useTestQuestions';
import { format } from 'date-fns';

export const StudentPerformance = () => {
    const { data: attempts = [], isLoading } = useAllStudentAttempts();

    // Calculate Stats
    const totalTests = attempts.length;

    // 1. Overall Average Score (Percentage)
    const avgScore = totalTests > 0
        ? Math.round(attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalTests)
        : 0;

    // 2. Tests Passed (Score >= Passing Marks)
    const passedTests = attempts.filter(a => a.score >= (a.tests?.passing_marks || 0)).length;

    // 3. Total Study Time (Seconds -> Hours)
    const totalTimeSeconds = attempts.reduce((acc, curr) => acc + (curr.time_taken || 0), 0);
    const totalTimeHours = Math.floor(totalTimeSeconds / 3600);
    const totalTimeMinutes = Math.floor((totalTimeSeconds % 3600) / 60);

    // 4. Subject-wise Performance
    const subjectStats: Record<string, { total: number; count: number }> = {};
    attempts.forEach(a => {
        const subject = a.tests?.subject || 'General';
        if (!subjectStats[subject]) {
            subjectStats[subject] = { total: 0, count: 0 };
        }
        subjectStats[subject].total += (a.percentage || 0);
        subjectStats[subject].count += 1;
    });

    const subjectPerformance = Object.entries(subjectStats).map(([subject, data]) => ({
        subject,
        score: Math.round(data.total / data.count),
        color: 'bg-blue-500' // You can map colors dynamically if needed
    })).sort((a, b) => b.score - a.score); // Sort by highest score

    const stats = [
        { icon: TrendingUp, label: 'Avg. Score', value: `${avgScore}%`, subtext: 'Overall performance', color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: CheckCircle, label: 'Tests Passed', value: `${passedTests}/${totalTests}`, subtext: 'Qualified tests', color: 'text-green-600', bg: 'bg-green-50' },
        { icon: Clock, label: 'Time Spent', value: `${totalTimeHours}h ${totalTimeMinutes}m`, subtext: 'Total test duration', color: 'text-amber-600', bg: 'bg-amber-50' },
        { icon: Award, label: 'Tests Taken', value: totalTests.toString(), subtext: 'Total attempts', color: 'text-purple-600', bg: 'bg-purple-50' }
    ];

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading performance data...</div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Performance Analysis</h1>
                <p className="text-slate-500">Track your progress, strengths, and areas for improvement.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow"
                    >
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                        <div className="text-sm font-medium text-slate-700">{stat.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{stat.subtext}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subject Performance */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart2 className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-900">Subject Wise Performance</h2>
                    </div>

                    {subjectPerformance.length > 0 ? (
                        <div className="space-y-5">
                            {subjectPerformance.map((subject, idx) => (
                                <div key={subject.subject}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-700">{subject.subject}</span>
                                        <span className="text-sm font-bold text-slate-900">{subject.score}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${subject.score >= 80 ? 'bg-green-500' :
                                                subject.score >= 60 ? 'bg-blue-500' :
                                                    subject.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${subject.score}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <p>No enough data to analyze subjects yet.</p>
                            <p className="text-sm mt-1">Take some tests to see your breakdown!</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-900">Recent Tests</h2>
                    </div>

                    <div className="space-y-4">
                        {attempts.slice(0, 5).map((attempt) => (
                            <div
                                key={attempt.id}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate pr-2">{attempt.tests?.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(attempt.created_at), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                </div>
                                <div className={`text-sm font-bold px-2 py-1 rounded-lg ${attempt.score >= (attempt.tests?.passing_marks || 0)
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                                    }`}>
                                    {attempt.percentage?.toFixed(0)}%
                                </div>
                            </div>
                        ))}

                        {attempts.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <p>No tests attempted yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
