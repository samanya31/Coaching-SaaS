import { useState, useMemo } from 'react';
import {
    TrendingUp,
    Users,
    BookOpen,
    IndianRupee,
    Trophy,
    AlertCircle,
    ArrowRight,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useUserCounts, useStudents } from '@/hooks/data/useUsers';
import { useBatches } from '@/hooks/data/useBatches';
import { usePayments } from '@/hooks/data/usePayments';
import { useStaffPayments } from '@/hooks/data/useStaffPayments';
import { Payment } from '@/types/payment';

export const Reports = () => {
    // Fetch real data
    const { data: userCounts } = useUserCounts();
    const { data: students = [] } = useStudents();
    const { data: batches = [] } = useBatches();
    const { data: payments = [] } = usePayments();
    const { data: staffPayments = [] } = useStaffPayments();

    // --- Calculations ---

    // 1. Overview Metrics
    const totalStudents = userCounts?.students || 0;
    const activeBatches = batches.length;

    // Revenue Calcs
    const totalRevenue = useMemo(() =>
        payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0),
        [payments]);

    const activeLearnersCount = totalStudents; // Proxy for now
    const avgTestScore = 72; // Placeholder until Test module is fully integrated

    // 2. Revenue Snapshot
    const thisMonthRevenue = useMemo(() => {
        const now = new Date();
        return payments
            .filter(p => {
                const pDate = new Date(p.date || p.created_at);
                return p.status === 'completed' &&
                    pDate.getMonth() === now.getMonth() &&
                    pDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, p) => sum + p.amount, 0);
    }, [payments]);

    // Revenue by Course (Batch)
    const revenueByBatch = useMemo(() => {
        const batchMap = new Map<string, number>();

        payments.forEach(p => {
            if (p.status === 'completed') {
                const batchName = p.batches?.name || 'Unassigned / General';
                const current = batchMap.get(batchName) || 0;
                batchMap.set(batchName, current + parseFloat(p.amount.toString())); // Ensure number
            }
        });

        // Convert to array and sort by revenue desc
        return Array.from(batchMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [payments]);

    // Formatters
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-500 mt-1">Key metrics and actionable insights for your institute</p>
            </div>

            {/* 1. Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Total Students */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Students</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalStudents}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>Active Learners</span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-green-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-500">
                        <span>Lifetime earnings</span>
                    </div>
                </div>

                {/* Avg Test Score */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-amber-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Avg Test Score</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{avgTestScore}%</h3>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors">
                            <Trophy className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>Good Performance</span>
                    </div>
                </div>

                {/* Instructor Payouts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-yellow-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Instructor Payouts</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                {formatCurrency(
                                    staffPayments
                                        .filter(p => {
                                            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                                            return p.payment_month === currentMonth || p.payment_date.startsWith(currentMonth);
                                        })
                                        .reduce((sum, p) => sum + p.amount, 0)
                                )}
                            </h3>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-500">
                        <span>This Month</span>
                    </div>
                </div>

                {/* Active Batches */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Active Batches</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{activeBatches}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <BookOpen className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-500">
                        <span>Running courses</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Revenue Snapshot & Academic Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2. Revenue Snapshot (Takes 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Revenue by Course</h2>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">Top 5</span>
                    </div>

                    {revenueByBatch.length > 0 ? (
                        <div className="space-y-4">
                            {revenueByBatch.map((batch, index) => (
                                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-gray-700">{batch.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Simple bar visual */}
                                        <div className="hidden sm:block w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${(batch.value / totalRevenue) * 100}%` }}
                                            />
                                        </div>
                                        <span className="font-bold text-gray-900 w-24 text-right">
                                            {formatCurrency(batch.value)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                            <IndianRupee className="w-8 h-8 mb-2 opacity-50" />
                            <p>No revenue data available yet</p>
                        </div>
                    )}
                </div>

                {/* 3. Academic Health (Takes 1 column) */}
                <div className="space-y-6">
                    {/* Academic Stats Box */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Academic Health</h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Avg Pass Rate</span>
                                    <span className="font-bold text-gray-900">85%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Course Completion</span>
                                    <span className="font-bold text-gray-900">64%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '64%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Low Engagement Alert Widget */}
                        <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <div className="flex gap-3">
                                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-orange-900 text-sm">Low Engagement Alert</h4>
                                    <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                                        "Advanced Physics" has <span className="font-bold">45%</span> attendance this week.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Action Widgets (Students At Risk) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h2 className="text-lg font-bold text-gray-900">Students At Risk (Inactive &gt; 7 Days)</h2>
                    </div>
                    <Button variant="outline" size="sm">View All</Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length > 0 ? (
                                students
                                    .filter(s => {
                                        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                                        const lastActiveTime = s.last_active ? new Date(s.last_active).getTime() : 0;
                                        const createdTime = s.created_at ? new Date(s.created_at).getTime() : Date.now();

                                        // Include inactive status
                                        if (s.status === 'inactive') return true;

                                        // If last_active is present, check if it's older than 7 days
                                        if (s.last_active) return lastActiveTime < sevenDaysAgo;

                                        // If never active, check if account is older than 7 days
                                        return createdTime < sevenDaysAgo;
                                    })
                                    .slice(0, 5)
                                    .map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{student.full_name}</td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {student.last_active ? new Date(student.last_active).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    student.status === 'blocked' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                                    Contact
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No students found at risk.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
