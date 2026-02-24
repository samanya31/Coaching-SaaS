import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { PhoneAuthModal } from '@/components/auth/PhoneAuthModal';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Faculty', path: '/faculty' },
    { name: 'Results', path: '/results' },
    { name: 'Demo Classes', path: '/demo-classes' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
];

export const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [userPhone, setUserPhone] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { loginWithPhone } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const handleOTPSuccess = async (phone: string) => {
        // Check if user has completed onboarding
        const hasOnboarded = localStorage.getItem(`onboarded_${phone}`);

        if (!hasOnboarded) {
            // First time user - show onboarding
            setUserPhone(phone);
            setShowOnboarding(true);
        } else {
            // Returning user - log in directly
            await loginWithPhone(phone);
            navigate('/student/dashboard');
        }
    };

    const handleOnboardingComplete = async (data: { name: string; examGoal: string; language: string }) => {
        // Save onboarding data
        localStorage.setItem(`onboarded_${userPhone}`, 'true');
        localStorage.setItem(`user_${userPhone}_profile`, JSON.stringify(data));

        // Log the user in
        await loginWithPhone(userPhone);

        // Navigate to batches page
        navigate('/student/dashboard/batches');
    };

    return (
        <>
            {/* Phone Auth Modal - Render at root level */}
            <PhoneAuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={handleOTPSuccess}
            />

            {/* Onboarding Modal */}
            <OnboardingModal
                isOpen={showOnboarding}
                onComplete={handleOnboardingComplete}
            />

            <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
                {/* Top Bar */}
                <div className="hidden md:block bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white py-2">
                    <div className="container-custom flex items-center justify-between text-sm">
                        <div className="flex items-center gap-6">
                            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                                <Phone className="w-4 h-4" />
                                +919876543210
                            </a>
                            <span className="text-white/70">Mon - Sat: 9:00 AM - 8:00 PM</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="#" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                                <Download className="w-4 h-4" />
                                Download App
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main Nav */}
                <nav className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-amber-700">EduMentor</span>
                                <span className="text-xs text-stone-600 -mt-1">Excellence in Education</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <Navigation />

                        {/* CTA Buttons */}
                        <div className="hidden lg:flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowAuthModal(true)}
                                className="border-2 border-stone-300 text-stone-700 hover:border-amber-500 hover:bg-amber-50 rounded-lg px-6"
                            >
                                Log in
                            </Button>
                            <Button
                                onClick={() => setShowAuthModal(true)}
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-400/30 text-white rounded-lg px-6"
                            >
                                Get Started
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="lg:hidden overflow-hidden"
                            >
                                <div className="py-6 space-y-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`block px-4 py-2 rounded-lg transition-colors ${location.pathname === link.path
                                                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                                                : 'hover:bg-amber-50 text-stone-700'
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                    <div className="pt-4 space-y-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowAuthModal(true)}
                                            className="w-full border-2 border-stone-300 text-stone-700 hover:border-amber-500 hover:bg-amber-50"
                                        >
                                            Log in
                                        </Button>
                                        <Button
                                            onClick={() => setShowAuthModal(true)}
                                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-400/30"
                                        >
                                            Get Started
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>
            </header>
        </>
    );
};
