import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/app/providers/TenantProvider';
import { supabase } from '@/config/supabase';
import { updateStudentProfile } from '@/services/auth/studentAuth.service';

/**
 * TEST LOGIN COMPONENT
 * This is a temporary component for testing authentication without SMS/OTP
 * Uses email+password instead of phone+OTP for testing
 * 
 * Test credentials:
 * Email: teststudent@test.com
 * Password: test123
 */
export const StudentLoginTest = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Onboarding state
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [name, setName] = useState('');
    const [language, setLanguage] = useState('English');
    const [course, setCourse] = useState('JEE');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { coaching, isLoading: isTenantLoading } = useTenant();
    const navigate = useNavigate();

    // Test login with password (no OTP)
    const handleTestLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!coaching?.id) {
                setError('System error: Coaching context missing');
                setLoading(false);
                return;
            }

            // Step 1: Sign in with email+password (test mode)
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) throw authError;
            if (!data.user) throw new Error('Login failed');

            // Step 2: Fetch profile
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            // Check if profile exists
            if (profileError || !profile) {
                await supabase.auth.signOut();
                throw new Error('Your account is not registered with this institute. Contact admin.');
            }

            // Check institute isolation
            if (profile.coaching_id !== coaching.id) {
                await supabase.auth.signOut();
                throw new Error('Wrong institute. Please use the correct login portal.');
            }

            setCurrentProfile(profile);

            // Check if onboarding needed
            if (!profile.full_name) {
                setShowOnboarding(true);
            } else {
                navigate('/student/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Complete onboarding
    const handleCompleteOnboarding = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!name.trim()) {
                setError('Please enter your name');
                setLoading(false);
                return;
            }

            await updateStudentProfile(currentProfile.id, {
                full_name: name,
                exam_goal: course,
                language: language
            });

            navigate('/student/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isTenantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Onboarding Screen
    if (showOnboarding) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
                >
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-[#1E3A8A] mb-2">Complete Your Profile</h1>
                        <p className="text-[#6B7280]">Tell us a bit about yourself to get started</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-2">
                                Your Course/Exam Goal
                            </label>
                            <select
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                            >
                                <option value="JEE">JEE (Engineering)</option>
                                <option value="NEET">NEET (Medical)</option>
                                <option value="UPSC">UPSC (Civil Services)</option>
                                <option value="SSC">SSC</option>
                                <option value="Banking">Banking</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#374151] mb-2">
                                Preferred Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                            >
                                <option value="English">English</option>
                                <option value="Hinglish">Hinglish</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/30 transition-all duration-300"
                        >
                            {loading ? 'Setting up...' : 'Complete Profile'}
                        </Button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // Test Login Screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">E</span>
                        </div>
                        <span className="text-2xl font-bold text-[#1E3A8A]">{coaching?.name || 'EduMentor'}</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">TEST Login</h1>
                    <p className="text-[#6B7280]">Testing auth without SMS</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Test credentials info */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800 mb-1">Test Credentials</p>
                        <p className="text-xs text-blue-700">Email: teststudent@test.com</p>
                        <p className="text-xs text-blue-700">Password: test123</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleTestLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[#374151] mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="teststudent@test.com"
                                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-[#374151] mb-2">
                                Password (Test)
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter test password"
                                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Test Login'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-[#6B7280]">
                            This is a test login page. OTP login coming soon!
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-[#6B7280] hover:text-[#374151] text-sm">
                        ← Back to Homepage
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};
