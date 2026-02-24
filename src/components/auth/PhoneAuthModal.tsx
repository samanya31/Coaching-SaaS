import { useState, useRef, useEffect } from 'react';
import { X, Phone, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhoneAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (phone: string) => void;
}

export const PhoneAuthModal = ({ isOpen, onClose, onSuccess }: PhoneAuthModalProps) => {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [countryCode, setCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer for OTP
    useEffect(() => {
        if (step === 'otp' && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [step, timer]);

    const handleGetOTP = () => {
        // Accept any phone number for now
        if (phoneNumber.length > 0) {
            // Here you would call your API to send OTP
            console.log('Sending OTP to:', countryCode + phoneNumber);
            setStep('otp');
            setTimer(60);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = () => {
        const otpValue = otp.join('');
        if (otpValue.length === 6) {
            // Accept any OTP for now (in production, verify with API)
            console.log('Accepting OTP:', otpValue);
            onSuccess(countryCode + phoneNumber);
            onClose();
        }
    };

    const handleEditPhone = () => {
        setStep('phone');
        setOtp(['', '', '', '', '', '']);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="p-8">
                        {step === 'phone' ? (
                            <>
                                {/* Phone Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-200 flex items-center justify-center">
                                            <Phone className="w-16 h-16 text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                    Please enter your Mobile Number
                                </h2>

                                {/* Phone Input */}
                                <div className="mt-6">
                                    <div className="flex gap-2">
                                        {/* Country Code */}
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="w-24 px-3 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-gray-700"
                                        >
                                            <option value="+91">+91</option>
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                        </select>

                                        {/* Phone Number */}
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                            placeholder="9876543210"
                                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-lg"
                                        />
                                    </div>
                                </div>

                                {/* Get OTP Button */}
                                <button
                                    onClick={handleGetOTP}
                                    disabled={phoneNumber.length === 0}
                                    className="w-full mt-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Get OTP
                                </button>

                                {/* Terms */}
                                <p className="mt-4 text-xs text-center text-gray-500">
                                    By continuing you agree to our{' '}
                                    <a href="#" className="text-indigo-600 hover:underline">
                                        Terms of use
                                    </a>{' '}
                                    &{' '}
                                    <a href="#" className="text-indigo-600 hover:underline">
                                        Privacy Policy
                                    </a>
                                </p>
                            </>
                        ) : (
                            <>
                                {/* OTP Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-200 flex items-center justify-center">
                                            <MessageSquare className="w-16 h-16 text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                    Enter OTP
                                </h2>

                                {/* Phone Number with Edit */}
                                <p className="text-center text-gray-600 mb-6">
                                    6 digit code sent to{' '}
                                    <span className="font-semibold text-indigo-600">
                                        {countryCode + phoneNumber}
                                    </span>
                                    <button
                                        onClick={handleEditPhone}
                                        className="ml-2 text-indigo-600 hover:underline text-sm"
                                    >
                                        ✏️
                                    </button>
                                </p>

                                {/* OTP Input */}
                                <div className="flex gap-2 justify-center mb-4">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (otpInputs.current[index] = el)}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                                        />
                                    ))}
                                </div>

                                {/* Timer */}
                                <p className="text-center text-gray-600 mb-6">
                                    {formatTime(timer)}
                                </p>

                                {/* Verify Button */}
                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={otp.join('').length !== 6}
                                    className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Verify & Proceed
                                </button>

                                {/* Resend */}
                                {timer === 0 && (
                                    <button
                                        onClick={() => {
                                            setTimer(60);
                                            setOtp(['', '', '', '', '', '']);
                                        }}
                                        className="w-full mt-4 text-indigo-600 hover:underline font-medium"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
