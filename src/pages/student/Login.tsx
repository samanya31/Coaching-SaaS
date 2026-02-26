import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/app/providers/TenantProvider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/config/supabase';
import { updateStudentProfile } from '@/services/auth/studentAuth.service';
import studentPortal from '@/assets/student_portal.png';
import studentPortalRes from '@/assets/student_portal_res.png';

/**
 * Student Login with Email + Password
 * Students login with auto-generated email and password set by admin
 */
export const StudentLogin = () => {
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
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Only enforce institute isolation if user explicitly set a ?tenant= param in the URL
    const tenantParam = new URLSearchParams(location.search).get('tenant');
    const isExplicitTenant = !!tenantParam;

    // Redirect if already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('studentUser');
        if (storedUser) {
            try {
                const studentUser = JSON.parse(storedUser);
                if (studentUser?.id && studentUser?.email) {
                    navigate('/student/dashboard', { replace: true });
                }
            } catch {
                // Invalid stored user, continue to login
            }
        }
    }, [navigate]);

    // Email+Password Login using AuthContext (bcrypt-based)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Use AuthContext login function (bcrypt-based)
            const success = await login(email, password);

            if (!success) {
                throw new Error('Invalid email or password. Please check your credentials.');
            }

            // Fetch profile to check onboarding and institute isolation
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .ilike('email', email)
                .maybeSingle();

            if (profileError || !profile) {
                throw new Error('Your account is not registered with this institute. Contact admin.');
            }

            // Check institute isolation ONLY when the user explicitly navigated to a
            // tenant-specific URL (e.g. /student/login?tenant=some-slug).
            // On the default login page, any student from any coaching can log in.
            if (isExplicitTenant && coaching?.id && profile.coaching_id !== coaching.id) {
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
            setError(err.message || 'Login failed. Please check your credentials.');
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

    // Login Screen
    return (
        <div className="relative min-h-screen overflow-hidden">

            {/* ===== PAGE BACKGROUND SPLIT ===== */}
            <div className="absolute inset-0 flex flex-col lg:flex-row">
                {/* LEFT GREY HALF */}
                <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-[#F2F5FA]" />

                {/* RIGHT BLUE HALF */}
                <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-[#EDF2FF]" />
            </div>

            {/* ===== CENTER FLOATING CARD ===== */}
            <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">

                <div className="
        w-full
        max-w-[1400px]
        h-auto
        lg:h-[85vh]
        min-h-[600px]
        bg-white
        rounded-3xl
        shadow-[0_40px_80px_rgba(0,0,0,0.08)]
        overflow-hidden
        flex
        flex-col
        lg:flex-row
      ">

                    {/* LEFT LOGIN (100% Mobile/Tablet / 50% Desktop) */}
                    <div className="w-full lg:w-1/2 flex flex-col pt-0 lg:pt-12 p-8 sm:p-12 lg:px-16 pb-12 overflow-y-auto">

                        <div className="w-[calc(100%+4rem)] -mx-8 sm:-mx-12 h-64 lg:hidden relative shrink-0 -mt-8 sm:-mt-12 bg-[#EAF2FB] overflow-hidden mb-8">
                            {/* background shapes */}
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_25%_30%,#c7d2fe,transparent_45%),radial-gradient(circle_at_80%_70%,#bfdbfe,transparent_45%)]" />

                            <img
                                src={studentPortalRes}
                                alt="Student Portal"
                                className="w-full h-full object-contain object-bottom relative z-10"
                            />
                            {/* Gradient Overlay for smooth transition into the white form */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent z-20"></div>
                        </div>

                        <div className="w-full max-w-md mx-auto flex flex-col justify-center h-full">
                            <h1 className="text-3xl font-bold text-[#3B82F6] mb-2">
                                Login
                            </h1>

                            <p className="text-[#64748B] text-sm mb-8">
                                Enter your account details
                            </p>

                            {error && (
                                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <input
                                    placeholder="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all"
                                    required
                                />

                                <input
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all"
                                    required
                                />

                                <div className="flex items-center justify-between mt-2">
                                    <Link to="#" className="text-sm text-[#3B82F6] hover:text-blue-700 font-medium">
                                        Forgot Password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email || !password}
                                    className="w-full bg-[#3B82F6] hover:bg-blue-600 transition-colors text-white py-4 rounded-xl font-medium disabled:opacity-50 mt-4"
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT IMAGE (Hidden Mobile & Tablet / 50% Desktop) */}
                    <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center bg-[#EAF2FB]">

                        {/* background shapes */}
                        <div className="absolute inset-0 opacity-40
    bg-[radial-gradient(circle_at_25%_30%,#c7d2fe,transparent_45%),
        radial-gradient(circle_at_80%_70%,#bfdbfe,transparent_45%)]"
                        />

                        <img
                            src={studentPortal}
                            alt="Student Portal"
                            className="
absolute
left-0
top-1/2
-translate-y-1/2
h-[110%]
max-w-none
object-contain
"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};
