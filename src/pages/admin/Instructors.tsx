import { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Trash2, Edit2, Mail, Phone, DollarSign, CheckCircle, XCircle, Users, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useInstructors } from '@/hooks/data/useInstructors';
import { useStaffPayments, useCreateStaffPayment } from '@/hooks/data/useStaffPayments';
import { useBatches } from '@/hooks/data/useBatches'; // Assuming this exists
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from 'date-fns';

export const Instructors = () => {
    const { data: instructors = [], isLoading } = useInstructors();
    const { data: payments = [] } = useStaffPayments();
    const { data: batches = [] } = useBatches();
    const createPayment = useCreateStaffPayment();

    const [searchQuery, setSearchQuery] = useState('');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentRemarks, setPaymentRemarks] = useState('');

    // Payment History Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedInstructorForHistory, setSelectedInstructorForHistory] = useState<any>(null);

    // Filter instructors
    const filteredInstructors = instructors.filter(instructor => {
        const matchesSearch =
            instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            instructor.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Helper to get batches for an instructor
    const getInstructorBatches = (instructorId: string) => {
        return batches.filter(batch => batch.instructor_id === instructorId || batch.instructor === instructorId /* fallback */);
    };

    // Helper to check payment status for current month
    const getPaymentStatus = (instructorId: string) => {
        const currentMonth = format(new Date(), 'yyyy-MM');
        const hasPayment = payments.some(p =>
            p.staff_id === instructorId &&
            (p.payment_month === currentMonth || p.payment_date.startsWith(currentMonth))
        );
        return hasPayment ? 'paid' : 'unpaid';
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInstructor || !paymentAmount) return;

        try {
            await createPayment.mutateAsync({
                staff_id: selectedInstructor.id,
                amount: parseFloat(paymentAmount),
                payment_date: new Date().toISOString().split('T')[0],
                payment_month: format(new Date(), 'yyyy-MM'),
                status: 'completed',
                method: 'cash', // Defaulting to cash for now
                remarks: paymentRemarks
            });
            toast.success(`Payment recorded for ${selectedInstructor.name}`);
            setPaymentModalOpen(false);
            setPaymentAmount('');
            setPaymentRemarks('');
            setSelectedInstructor(null);
        } catch (error) {
            toast.error("Failed to record payment");
        }
    };

    const openPaymentModal = (instructor: any) => {
        setSelectedInstructor(instructor);
        setPaymentModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Instructors</h1>
                    <p className="text-gray-600 mt-1">Manage teaching faculty, assignments, and payments</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/dashboard/instructors/new">
                        <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4" />
                            Add Instructor
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search instructors by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Instructors</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{instructors.length}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Instructors</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {instructors.filter(i => i.status === 'active').length}
                        </h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Instructors Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Batches</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Payment (This Month)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">Loading instructors...</TableCell>
                            </TableRow>
                        ) : filteredInstructors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No instructors found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredInstructors.map((instructor) => {
                                const instructorBatches = getInstructorBatches(instructor.id);
                                const paymentStatus = getPaymentStatus(instructor.id);

                                return (
                                    <TableRow key={instructor.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {instructor.avatar ? (
                                                        <img src={instructor.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-600">{instructor.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{instructor.name}</div>
                                                    <div className="text-xs text-gray-500">{instructor.subject}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {instructor.phone}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {instructor.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {instructorBatches.length > 0 ? (
                                                    instructorBatches.map(b => (
                                                        <Badge key={b.id} variant="outline" className="text-xs">
                                                            {b.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs text-italic">No batches</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-medium text-gray-700">
                                                <Users className="w-4 h-4 text-gray-500" />
                                                {instructorBatches.reduce((sum, batch) => {
                                                    // Handle both direct property and nested Supabase count
                                                    const count = batch.current_students || (batch as any).batch_enrollments?.[0]?.count || 0;
                                                    return sum + count;
                                                }, 0)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {paymentStatus === 'paid' ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Paid
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                                                    <XCircle className="w-3 h-3 mr-1" /> Unpaid
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={instructor.status === 'active' ? 'default' : 'secondary'} className={instructor.status === 'active' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : ''}>
                                                {instructor.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openPaymentModal(instructor)}>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        Record Payment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedInstructorForHistory(instructor);
                                                        setHistoryModalOpen(true);
                                                    }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View History
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/admin/dashboard/instructors/${instructor.id}/edit`}>
                                                            <Edit2 className="mr-2 h-4 w-4" />
                                                            Edit Profile
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Payment Modal */}
            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Payment for {selectedInstructor?.name}</DialogTitle>
                        <DialogDescription>
                            Enter the payment details for this month.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRecordPayment} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                required
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks (Optional)</Label>
                            <Input
                                id="remarks"
                                placeholder="e.g. October Salary"
                                value={paymentRemarks}
                                onChange={(e) => setPaymentRemarks(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Record Payment</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Payment History Modal */}
            <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Payment History: {selectedInstructorForHistory?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Full transaction history and payout details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Payment ID</TableHead>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments
                                        .filter(p => p.staff_id === selectedInstructorForHistory?.id)
                                        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                                        .length > 0 ? (
                                        payments
                                            .filter(p => p.staff_id === selectedInstructorForHistory?.id)
                                            .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                                            .map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell className="font-mono text-xs text-gray-500">
                                                        {payment.reference_id || `#${payment.id.slice(0, 8)}`}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-indigo-600">
                                                        {format(new Date(payment.payment_month), 'MMMM yyyy')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                                                    </TableCell>
                                                    <TableCell className="font-bold">
                                                        ₹{payment.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                                            Paid
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500 text-sm max-w-[150px] truncate" title={payment.remarks || ''}>
                                                        {payment.remarks || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No payment history found for this instructor.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setHistoryModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
