import { useState, useMemo } from 'react';
import {
    Search, Filter, Download, ArrowUpRight, CheckCircle,
    AlertCircle, Clock, RotateCcw, IndianRupee,
    Calendar, MoreVertical, Eye, Trash2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Payment } from '@/types/payment';
import { usePayments, useUpdatePaymentStatus } from '@/hooks/data/usePayments';
import { useStudents } from '@/hooks/data/useUsers';
import { useBatches } from '@/hooks/data/useBatches';
import { useTenant } from '@/app/providers/TenantProvider';
import { format, subDays, startOfMonth, isAfter, isSameDay, parseISO } from 'date-fns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-700';
        case 'pending':
            return 'bg-amber-100 text-amber-700';
        case 'failed':
            return 'bg-red-100 text-red-700';
        case 'refunded':
            return 'bg-gray-100 text-gray-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'completed':
            return <CheckCircle className="w-4 h-4" />;
        case 'pending':
            return <Clock className="w-4 h-4" />;
        case 'failed':
            return <AlertCircle className="w-4 h-4" />;
        case 'refunded':
            return <RotateCcw className="w-4 h-4" />;
        default:
            return null;
    }
};

export const Finance = () => {
    const { data: payments = [], isLoading } = usePayments();
    const { data: students = [] } = useStudents();
    const { data: batches = [] } = useBatches();
    const { coachingId } = useTenant();

    const updateStatusMutation = useUpdatePaymentStatus();


    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [periodFilter, setPeriodFilter] = useState<string>('all');
    const [modeFilter, setModeFilter] = useState<string>('all');

    // Modal State
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // 1. Calculate Business Stats
    const stats = useMemo(() => {
        const total = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const monthStart = startOfMonth(new Date());
        const thisMonth = payments
            .filter(p => p.status === 'completed' && isAfter(new Date(p.date || p.created_at), monthStart))
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const refunded = payments
            .filter(p => p.status === 'refunded')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const failed = payments.filter(p => p.status === 'failed').length;

        return { total, thisMonth, refunded, failed };
    }, [payments]);

    // 2. Prepare Chart Data (Last 7 Days)
    const chartData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i);
            const dayName = format(date, 'EEE');
            const dailyRevenue = payments
                .filter(p => p.status === 'completed' && isSameDay(new Date(p.date || p.created_at), date))
                .reduce((sum, p) => sum + Number(p.amount), 0);

            return { name: dayName, revenue: dailyRevenue };
        });
        return last7Days;
    }, [payments]);

    // 3. Filter Payments
    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const studentName = payment.students?.full_name || 'Unknown';
            const studentEmail = payment.students?.email || '';
            const description = payment.description || '';
            const txnId = payment.transaction_id || payment.id;
            const batchName = payment.batches?.name || '';

            const matchesSearch =
                studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                batchName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
            const matchesMode = modeFilter === 'all' || payment.payment_method?.toLowerCase() === modeFilter.toLowerCase();

            let matchesPeriod = true;
            const pDate = new Date(payment.date || payment.created_at);
            if (periodFilter === 'today') matchesPeriod = isSameDay(pDate, new Date());
            else if (periodFilter === 'this_month') matchesPeriod = isAfter(pDate, startOfMonth(new Date()));

            return matchesSearch && matchesStatus && matchesMode && matchesPeriod;
        });
    }, [payments, searchQuery, statusFilter, periodFilter, modeFilter]);

    const handleRefund = async (id: string) => {
        if (window.confirm('Are you sure you want to mark this payment as refunded?')) {
            await updateStatusMutation.mutateAsync({ id, status: 'refunded' });
            setIsDetailModalOpen(false);
            toast.success('Refund processed successfully');
        }
    };



    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard 💰</h1>
                    <p className="text-gray-600 mt-1">Real-time revenue tracking and transaction management</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.total.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-green-600">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        <span>All time collection</span>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">This Month</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.thisMonth.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-blue-600">
                        <span>Current billing cycle</span>
                    </div>
                </div>

                {/* Refunds */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Refunded</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.refunded.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-500">
                        <span>Processed reversals</span>
                    </div>
                </div>

                {/* Failed */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Failed Payments</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-medium text-red-500">
                        <span>Unsuccessful attempts</span>
                    </div>
                </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
                        <p className="text-sm text-gray-500">Success collection in the last 7 days</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-600">Amount (₹)</span>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 w-full lg:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find by student, payment ID, or course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>

                    {/* Selects */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">Revenue Period: All</option>
                            <option value="today">Today</option>
                            <option value="this_month">This Month</option>
                        </select>

                        <select
                            value={modeFilter}
                            onChange={(e) => setModeFilter(e.target.value)}
                            className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">Payment Mode: All</option>
                            <option value="upi">UPI</option>
                            <option value="card">Card</option>
                            <option value="netbanking">NetBanking</option>
                            <option value="cash">Cash</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="all">Status: All</option>
                            <option value="completed">Success Only</option>
                            <option value="failed">Failed Only</option>
                            <option value="refunded">Refunded Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batch/Course</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-gray-400">#{payment.transaction_id || payment.id.slice(0, 8)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {(payment.students?.full_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm leading-none">{payment.students?.full_name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500 mt-1">{payment.students?.phone || payment.students?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-700 font-medium">{payment.batches?.name || payment.description}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 tracking-tight">₹{Number(payment.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                            {payment.payment_method || 'Online'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 font-medium">{format(new Date(payment.date || payment.created_at), 'MMM d, yyyy')}</p>
                                        <p className="text-[10px] text-gray-400">{format(new Date(payment.date || payment.created_at), 'h:mm a')}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(payment.status)}`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600"
                                            onClick={() => {
                                                setSelectedPayment(payment);
                                                setIsDetailModalOpen(true);
                                            }}
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPayments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                            <IndianRupee className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">📦 No transactions yet</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs text-center">
                            Start selling courses to see payments and revenue data here.
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Payment Details</DialogTitle>
                        <DialogDescription>
                            Full transaction information and refund control
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="space-y-6 pt-4">
                            {/* Student Info */}
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {selectedPayment.students?.full_name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{selectedPayment.students?.full_name}</h4>
                                    <p className="text-sm text-gray-500">{selectedPayment.students?.email}</p>
                                    <p className="text-sm text-gray-500">{selectedPayment.students?.phone}</p>
                                </div>
                            </div>

                            {/* Transaction Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Transaction ID</p>
                                    <p className="font-mono text-sm text-gray-900 mt-1 overflow-hidden text-ellipsis">
                                        {selectedPayment.transaction_id || selectedPayment.id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order Amount</p>
                                    <p className="font-bold text-gray-900 text-lg mt-1">
                                        ₹{Number(selectedPayment.amount).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Payment Mode</p>
                                    <p className="font-bold text-gray-900 mt-1 capitalize">
                                        {selectedPayment.payment_method || 'Online'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 uppercase tracking-wide ${getStatusStyle(selectedPayment.status)}`}>
                                        {selectedPayment.status}
                                    </span>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Item Purchased</p>
                                <div className="mt-2 p-3 border border-gray-100 rounded-lg flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Eye className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <span className="font-medium text-gray-800">{selectedPayment.batches?.name || selectedPayment.description}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedPayment.status === 'completed' && (
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => handleRefund(selectedPayment.id)}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Process Refund
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => setIsDetailModalOpen(false)}>
                                        Close
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>


        </div>
    );
};

