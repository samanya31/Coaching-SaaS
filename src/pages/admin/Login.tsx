import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/config/supabase';
import { ASSETS } from '@/config/assets';

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Look up user by email in the users table
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('*, coachings(id, name, slug)')
                .ilike('email', email)
                .maybeSingle();

            console.log('🔍 User lookup:', {
                email,
                found: !!existingUser,
                hasPasswordHash: !!existingUser?.password_hash,
                error: checkError?.message,
            });

            if (checkError) {
                console.error('DB lookup error:', checkError);
                throw new Error('Could not connect to database. Please run the SQL grant and try again.');
            }

            if (!existingUser) {
                throw new Error('No account found with this email address.');
            }

            // If user has password_hash, use bcrypt verification (custom auth)
            if (existingUser.password_hash) {
                console.log('Using custom authentication...');

                // Import bcrypt dynamically
                const bcrypt = await import('bcryptjs');

                // Check password with bcrypt (PRODUCTION SECURE!)
                const passwordMatch = await bcrypt.compare(password, existingUser.password_hash);

                if (!passwordMatch) {
                    throw new Error('Invalid email or password');
                }

                // Check if coaching exists
                if (!existingUser.coachings) {
                    throw new Error('Your account is not associated with a valid coaching institute.');
                }

                // Check if user has admin/teacher role
                if (!['coaching_admin', 'super_admin', 'teacher', 'staff'].includes(existingUser.role)) {
                    throw new Error('Access denied. Admin or teacher role required.');
                }

                // Store user info in localStorage
                localStorage.setItem('adminUser', JSON.stringify({
                    id: existingUser.id,
                    email: existingUser.email,
                    name: existingUser.full_name,
                    role: existingUser.role,
                    coachingId: existingUser.coaching_id,
                    coachingName: existingUser.coachings.name,
                    coachingSlug: existingUser.coachings.slug,
                }));

                // Also establish a Supabase Auth session so RLS policies work.
                try {
                    await supabase.auth.signInWithPassword({ email, password });
                } catch (_) { /* ignore — custom auth still works even if Supabase session fails */ }

                console.log('✅ Custom auth successful!');
                navigate('/admin/dashboard', { replace: true });
                return;
            }

            // If user doesn't exist in custom table or has no password_hash, try Supabase Auth
            console.log('Trying Supabase Auth...');
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error('Supabase auth error:', authError);
                throw new Error('Invalid email or password.');
            }

            if (!authData.user) {
                throw new Error('Login failed. Please try again.');
            }

            // Fetch user profile from users table
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*, coachings(id, name, slug)')
                .eq('id', authData.user.id)
                .maybeSingle();

            if (profileError || !profileData) {
                await supabase.auth.signOut();
                throw new Error('Your account is not registered. Contact administrator.');
            }

            // Check if coaching exists
            if (!profileData.coachings) {
                await supabase.auth.signOut();
                throw new Error('Your account is not associated with a valid coaching institute.');
            }

            // Check if user has admin/teacher role
            if (!['coaching_admin', 'super_admin', 'teacher', 'staff'].includes(profileData.role)) {
                await supabase.auth.signOut();
                throw new Error('Access denied. Admin or teacher role required.');
            }

            // Store user info in localStorage
            localStorage.setItem('adminUser', JSON.stringify({
                id: profileData.id,
                email: profileData.email,
                name: profileData.full_name,
                role: profileData.role,
                coachingId: profileData.coaching_id,
                coachingName: profileData.coachings.name,
                coachingSlug: profileData.coachings.slug,
            }));

            console.log('✅ Supabase Auth successful!');
            navigate('/admin/dashboard', { replace: true });

        } catch (err: any) {
            console.error('Login error:', err.message);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen font-sans text-gray-100 flex flex-col">
            {/* ===== PAGE BACKGROUND SPLIT ===== */}
            <div className="absolute inset-0 flex flex-col lg:flex-row">
                {/* LEFT DARK HALF */}
                <div className="w-full lg:w-1/2 h-full bg-[#0B0E13]" />

                {/* RIGHT BLUE HALF */}
                <div className="hidden lg:block lg:w-1/2 h-full bg-[#6188FC]" />
            </div>

            {/* ===== CENTER FLOATING CARD ===== */}
            <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">

                <div className="
                    w-full
                    max-w-[1400px]
                    h-auto
                    lg:h-[85vh]
                    min-h-[600px]
                    bg-[#151821]
                    rounded-3xl
                    shadow-[0_40px_80px_rgba(0,0,0,0.5)]
                    overflow-hidden
                    flex
                    flex-col
                    lg:flex-row
                    lg:border-none
                    border
                    border-gray-800
                ">

                    {/* LEFT LOGIN (100% Mobile/Tablet / 50% Desktop) */}
                    <div className="w-full lg:w-1/2 flex flex-col pt-0 lg:pt-12 p-8 sm:p-12 lg:px-16 pb-12 overflow-y-auto">

                        {/* Mobile Box Image */}
                        <div className="w-[calc(100%+4rem)] -mx-8 sm:-mx-12 h-64 lg:hidden relative shrink-0 -mt-8 sm:-mt-12 bg-[#0B0A1C] overflow-hidden mb-8">
                            {/* Subtle light flares for depth */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#6188FC]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <img
                                src={ASSETS.adminPortalRes}
                                alt="Admin Portal"
                                className="w-full h-full object-cover object-center relative z-10"
                            />
                            {/* Dark Gradient Overlay for smooth transition into the form */}
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#151821] to-transparent z-20"></div>
                        </div>

                        <div className="w-full max-w-[380px] mx-auto flex flex-col justify-center h-full">
                            {/* Header */}
                            <div className="mb-10 text-left">
                                <h2 className="text-[32px] font-bold text-white mb-2 tracking-wide">Login</h2>
                                <p className="text-[#8B8D97] text-[14px]">Enter your account details</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 text-sm mt-0.5">{error}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-1">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6D77] transition-colors group-focus-within:text-[#6188FC]">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Username"
                                            required
                                            className="block w-full pl-11 pr-4 py-3.5 border border-[#2A2C35] rounded-[14px] text-white placeholder-[#6B6D77] focus:outline-none focus:border-[#6188FC] focus:ring-1 focus:ring-[#6188FC]/30 transition-all bg-[#1A1D27] text-[15px]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B6D77] transition-colors group-focus-within:text-[#6188FC]">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            required
                                            className="block w-full pl-11 pr-12 py-3.5 border border-[#2A2C35] rounded-[14px] text-white placeholder-[#6B6D77] focus:outline-none focus:border-[#6188FC] focus:ring-1 focus:ring-[#6188FC]/30 transition-all bg-[#1A1D27] text-[15px]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6D77] hover:text-gray-300 transition-colors focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-start pt-1 pb-3">
                                    <a href="#" className="text-[13px] text-[#6188FC] hover:text-[#7B9FFF] transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-[#7B61FF] to-[#3B82F6] hover:opacity-90 text-white rounded-[14px] py-6 text-[16px] font-semibold transition-all shadow-none mt-2 border-0"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        'Login'
                                    )}
                                </Button>
                            </form>
                        </div>

                        {/* Footer - pinned to bottom of left panel */}
                        <div className="mt-auto pt-8">
                            <p className="text-[11px] text-[#8B8D97] select-none">
                                © 2025 Vidya Yantra<br />
                                <span className="text-[#6188FC] font-medium">A product of Keshav Global Tech</span>
                            </p>
                        </div>
                    </div>

                    {/* RIGHT IMAGE (Hidden Mobile & Tablet / 50% Desktop) */}
                    <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-[#6188FC]">
                        {/* Subtle light flares for depth */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        {/* Actual Image */}
                        <img
                            src={ASSETS.adminPortal}
                            alt="Admin Portal Dashboard"
                            className="
    absolute
    left-0
    top-1/2
    -translate-y-1/2
    h-[110%]
    max-w-none
    object-contain
    drop-shadow-2xl
    z-10
  "
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
