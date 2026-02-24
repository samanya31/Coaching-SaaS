import { format } from 'date-fns';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useStudentPayments } from '@/hooks/data/usePayments';

export const StudentPayments = () => {
    const { data: payments = [], isLoading } = useStudentPayments();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'failed': return 'bg-red-100 text-red-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-gray-600">View all your transactions and invoices</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Description</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Payment Method</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {format(new Date(payment.created_at), 'MMM d, yyyy')}
                                        </div>
                                        <div className="text-xs text-gray-500 pl-6">
                                            {format(new Date(payment.created_at), 'h:mm a')}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-medium text-gray-900">{payment.description || 'Course Purchase'}</p>
                                        <p className="text-xs text-gray-500">ID: {payment.transaction_id || payment.id.slice(0, 8)}</p>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {payment.payment_method || 'Online'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-semibold text-gray-900">₹{payment.amount}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <CreditCard className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="font-medium">No payments found</p>
                                            <p className="text-sm mt-1">Your transaction history will appear here.</p>
                                        </div>
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
