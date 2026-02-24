import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, User as UserIcon, CheckCircle, Plus, Trash2, Ban, MoreVertical, CreditCard, Edit2, IndianRupee, IdCard, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudents, useDeleteUser, useUpdateUser } from '@/hooks/data/useUsers';
import { useBatches } from '@/hooks/data/useBatches';
import { useCreatePayment, usePayments, useUpdatePaymentStatus } from '@/hooks/data/usePayments';
import { useEnrollWithPayment } from '@/hooks/data/useEnrollment';
import { useTenant } from '@/app/providers/TenantProvider';
import { Payment } from '@/types/payment';
import { format } from 'date-fns';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export const Students = () => {
    // Fetch data from database
    const { data: studentsData = [], isLoading } = useStudents();
    const { data: batches = [] } = useBatches();
    const { data: allPayments = [] } = usePayments();
    const { coachingId } = useTenant();
    const deleteMutation = useDeleteUser();
    const updateMutation = useUpdateUser();
    const createPaymentMutation = useCreatePayment();
    const enrollWithPaymentMutation = useEnrollWithPayment();
    const updatePaymentStatusMutation = useUpdatePaymentStatus();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Refund Modal State
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [selectedStudentForRefund, setSelectedStudentForRefund] = useState<any>(null);

    // Manual Payment Form State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [open, setOpen] = useState(false); // For combobox
    const [manualPayment, setManualPayment] = useState({
        studentId: '',
        batchId: '',
        amount: '',
        method: 'cash' as Payment['payment_method'],
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
    });

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const amount = parseFloat(manualPayment.amount);

            if (manualPayment.batchId) {
                // If batch is selected, use the combined enrollment + payment mutation
                await enrollWithPaymentMutation.mutateAsync({
                    userId: manualPayment.studentId,
                    batchId: manualPayment.batchId,
                    amount,
                    method: manualPayment.method,
                    transactionId: `TXN_MANUAL_${Date.now()}`
                });
            } else {
                // Otherwise just record a general payment
                await createPaymentMutation.mutateAsync({
                    coaching_id: coachingId!,
                    student_id: manualPayment.studentId,
                    amount: amount,
                    payment_method: manualPayment.method,
                    status: 'completed',
                    date: new Date(manualPayment.date).toISOString(),
                    description: manualPayment.description || 'Manual Entry'
                });
            }

            setIsManualModalOpen(false);
            setManualPayment({
                studentId: '',
                batchId: '',
                amount: '',
                method: 'cash',
                date: format(new Date(), 'yyyy-MM-dd'),
                description: ''
            });
            toast.success(manualPayment.batchId ? 'Student enrolled and payment recorded!' : 'Manual payment recorded!');
        } catch (error) {
            toast.error('Failed to record payment');
        }
    };

    const handleOpenRefundModal = (student: any) => {
        setSelectedStudentForRefund(student);
        setIsRefundModalOpen(true);
    };

    const handleProcessRefund = async (paymentId: string) => {
        if (!window.confirm('Are you sure you want to refund this payment? This action cannot be undone.')) return;
        try {
            await updatePaymentStatusMutation.mutateAsync({ id: paymentId, status: 'refunded' });
            toast.success('Refund processed successfully');
        } catch (error) {
            toast.error('Failed to process refund');
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading students...</p>
                </div>
            </div>
        );
    }

    // Helper to determine payment status
    const getPaymentStatus = (student: any) => {
        const studentPayments = allPayments.filter((p: any) => p.student_id === student.id);

        // If they have any completed payment, they are "Paid"
        if (studentPayments.some((p: any) => p.status === 'completed')) return 'paid';

        // If they have payments but all are refunded, they are "Refunded"
        if (studentPayments.length > 0 && studentPayments.every((p: any) => p.status === 'refunded')) return 'refunded';

        // If they have batch enrollments but no payment record (legacy or manual), fallback:
        // But for this specific "refund" request, we want to show 'refunded' if explicitly refunded.
        // Let's stick to: Enrolled > 0 ? 'paid' : 'unpaid' AS FALLBACK if no payments found, 
        // BUT if we found payments and they are refunded, we return 'refunded'.

        return (student.batch_enrollments?.length || 0) > 0 ? 'paid' : 'unpaid';
    };

    // Filter students
    const filteredStudents = studentsData.filter(student => {
        const matchesSearch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.phone?.includes(searchQuery) ||
            student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.personal_email?.toLowerCase().includes(searchQuery.toLowerCase());

        const paymentStatus = getPaymentStatus(student);
        const matchesPayment = selectedPaymentStatus === 'all' ||
            (selectedPaymentStatus === 'paid' && paymentStatus === 'paid') ||
            (selectedPaymentStatus === 'unpaid' && paymentStatus === 'unpaid') ||
            (selectedPaymentStatus === 'refunded' && paymentStatus === 'refunded'); // Add refunded filter support if needed later

        const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

        return matchesSearch && matchesPayment && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    // Stats
    const activeCount = studentsData.filter(s => s.status === 'active').length;

    // Bulk Actions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudents(paginatedStudents.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (id: string) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(sId => sId !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Student deleted successfully');
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    const handleUpdateStatus = async (id: string, status: 'active' | 'blocked') => {
        try {
            await updateMutation.mutateAsync({ userId: id, updates: { status } });
            toast.success(`Student ${status === 'active' ? 'activated' : 'blocked'} successfully`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedStudents.length} students?`)) return;
        try {
            await Promise.all(selectedStudents.map(id => deleteMutation.mutateAsync(id)));
            setSelectedStudents([]);
            toast.success('Students deleted successfully');
        } catch (error) {
            toast.error('Failed to delete some students');
        }
    };

    const handleBlockSelected = async () => {
        try {
            await Promise.all(selectedStudents.map(id => updateMutation.mutateAsync({ userId: id, updates: { status: 'blocked' } })));
            setSelectedStudents([]);
            toast.success('Students blocked successfully');
        } catch (error) {
            toast.error('Failed to block some students');
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-600 mt-1">Operational Student List</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={() => setIsManualModalOpen(true)}
                    >
                        <IndianRupee className="w-4 h-4" />
                        Record Manual Payment
                    </Button>
                    <Link to="/admin/dashboard/students/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Student
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards (Simplified) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{studentsData.length}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Active Students</p>
                        <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 w-full md:w-auto">
                        {/* Payment Status Filter */}
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={selectedPaymentStatus}
                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm"
                            >
                                <option value="all">All Payments</option>
                                <option value="paid">Paid (Enrolled)</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="blocked">Blocked</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Toolbar (Visible when items selected) */}
            {selectedStudents.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {selectedStudents.length}
                        </span>
                        <span className="text-sm font-medium text-indigo-900">Students Selected</span>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-white hover:bg-green-50 text-green-700 border-green-200">
                            Mark Paid
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-white hover:bg-orange-50 text-orange-700 border-orange-200"
                            onClick={handleBlockSelected}
                        >
                            <Ban className="w-3 h-3 mr-1" /> Block
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-white hover:bg-red-50 text-red-700 border-red-200"
                            onClick={handleDeleteSelected}
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                    </div>
                </div>
            )}

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="w-12 px-6 py-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        onChange={handleSelectAll}
                                        checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Personal Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Batches</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedStudents.length > 0 ? (
                                paginatedStudents.map((student) => {
                                    const paymentStatus = getPaymentStatus(student);

                                    // Find latest payment for ID
                                    const studentPayments = allPayments.filter((p: any) => p.student_id === student.id);
                                    const latestPayment = studentPayments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                    const paymentId = latestPayment?.transaction_id || '-';

                                    return (
                                        <tr key={student.id} className={`hover:bg-gray-50 transition-colors ${selectedStudents.includes(student.id) ? 'bg-indigo-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => handleSelectStudent(student.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 uppercase">
                                                        {(student.full_name || 'U').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{student.full_name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {student.personal_email || <span className="text-gray-400 italic">Not set</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {student.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {student.batch_enrollments?.length > 0 ? (
                                                        student.batch_enrollments.map((e: any) => (
                                                            <span key={e.batch_id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                {e.batches?.name || 'Unknown'}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                {paymentId}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                    paymentStatus === 'refunded' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {paymentStatus === 'paid' ? 'Paid' :
                                                        paymentStatus === 'refunded' ? 'Refunded' : 'Unpaid'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* ID Card Download */}
                                                    <Link to={`/admin/dashboard/students/${student.id}/id-card`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50" title="Download ID Card">
                                                            <IdCard className="w-4 h-4" />
                                                        </Button>
                                                    </Link>

                                                    {/* Refund Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                                                        onClick={() => handleOpenRefundModal(student)}
                                                        title="Refund"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </Button>

                                                    <Link to={`/admin/dashboard/students/${student.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-indigo-600">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                        onClick={() => handleDeleteStudent(student.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-gray-500">
                                        No students found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified) */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Payment Modal */}
            <Dialog open={isManualModalOpen} onOpenChange={setIsManualModalOpen}>
                <DialogContent className="sm:max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Record Manual Payment</DialogTitle>
                        <DialogDescription>
                            Use this to record cash collections or manual bank transfers for students.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 flex flex-col gap-1">
                                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className={cn(
                                                "w-full justify-between font-normal",
                                                !manualPayment.studentId && "text-muted-foreground"
                                            )}
                                        >
                                            {manualPayment.studentId
                                                ? studentsData.find((s) => s.id === manualPayment.studentId)?.full_name
                                                : "Select student..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[460px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search student by name..." />
                                            <CommandList>
                                                <CommandEmpty>No student found.</CommandEmpty>
                                                <CommandGroup>
                                                    {studentsData.map((student) => (
                                                        <CommandItem
                                                            key={student.id}
                                                            value={student.full_name} // Used for filtering
                                                            onSelect={() => {
                                                                setManualPayment({ ...manualPayment, studentId: student.id });
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    manualPayment.studentId === student.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{student.full_name}</span>
                                                                <span className="text-xs text-gray-500">{student.phone || student.email}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch (Optional)</label>
                                <select
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={manualPayment.batchId}
                                    onChange={(e) => setManualPayment({ ...manualPayment, batchId: e.target.value })}
                                >
                                    <option value="">-- Choose Batch --</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    placeholder="5000"
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={manualPayment.amount}
                                    onChange={(e) => setManualPayment({ ...manualPayment, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                <select
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={manualPayment.method}
                                    onChange={(e) => setManualPayment({ ...manualPayment, method: e.target.value as Payment['payment_method'] })}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI/Manual Transfer</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={manualPayment.date}
                                    onChange={(e) => setManualPayment({ ...manualPayment, date: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <input
                                    type="text"
                                    placeholder="Received by cash at office"
                                    className="w-full bg-gray-50 border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={manualPayment.description}
                                    onChange={(e) => setManualPayment({ ...manualPayment, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsManualModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={createPaymentMutation.isPending || enrollWithPaymentMutation.isPending}>
                                {createPaymentMutation.isPending || enrollWithPaymentMutation.isPending ? 'Recording...' : 'Save Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Refund Selection Modal */}
            <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Process Refund</DialogTitle>
                        <DialogDescription>
                            Select a payment to refund for {selectedStudentForRefund?.full_name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto">
                        {allPayments.filter((p: any) => p.student_id === selectedStudentForRefund?.id && p.status === 'completed').length > 0 ? (
                            allPayments
                                .filter((p: any) => p.student_id === selectedStudentForRefund?.id)
                                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((payment: any) => (
                                    <div key={payment.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold text-gray-900">₹{parseFloat(payment.amount).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">{payment.batches?.name || payment.description || 'Unknown Item'}</p>
                                            <p className="text-[10px] text-gray-400">{format(new Date(payment.date), 'MMM d, yyyy')}</p>
                                        </div>
                                        <div>
                                            {payment.status === 'completed' ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleProcessRefund(payment.id)}
                                                    disabled={updatePaymentStatusMutation.isPending}
                                                >
                                                    <RotateCcw className="w-3 h-3 mr-1" />
                                                    Refund
                                                </Button>
                                            ) : (
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${payment.status === 'refunded' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {payment.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CreditCard className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                <p>No refundable payments found.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t pt-4 mt-2">
                        <Button variant="ghost" onClick={() => setIsRefundModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
