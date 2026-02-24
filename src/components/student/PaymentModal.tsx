import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    courseTitle: string;
    onConfirm: (paymentDetails: { method: string; transactionId: string }) => Promise<void>;
}

export const PaymentModal = ({ isOpen, onClose, amount, courseTitle, onConfirm }: PaymentModalProps) => {
    const [loading, setLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await onConfirm({
                method: 'Credit Card',
                transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            });
            // Don't close here, wait for parent to handle success/close
        } catch (error) {
            console.error('Payment Failed:', error);
            // Handle error in UI
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-indigo-600 p-6 text-white relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold mb-1">Secure Payment</h2>
                        <p className="text-indigo-100 text-sm flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Encrypted & Secure
                        </p>
                        <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-3xl font-bold">₹{amount.toLocaleString()}</span>
                            <span className="text-indigo-100 text-sm">/ one-time</span>
                        </div>
                        <p className="mt-2 text-indigo-100 text-sm">
                            For: <span className="font-semibold">{courseTitle}</span>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Cardholder Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="0000 0000 0000 0000"
                                    maxLength={19}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">CVV</label>
                                <input
                                    type="password"
                                    required
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    placeholder="123"
                                    maxLength={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                `Pay ₹${amount.toLocaleString()}`
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-4 mt-4">
                            {/* Mock Payment Icons */}
                            <div className="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">VISA</div>
                            <div className="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">MC</div>
                            <div className="h-6 w-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">UPI</div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
