import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/config/supabase';

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
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">ExamEdge</h1>
                            <p className="text-white/80 text-sm">Admin Portal</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-4">Manage Your Institution</h2>
                    <p className="text-white/90 text-lg mb-8">
                        Comprehensive admin dashboard to manage students, courses, instructors, and analytics.
                    </p>
                    <div className="space-y-4">
                        {[
                            { title: 'Student Management', desc: 'Track enrollment, performance, and engagement' },
                            { title: 'Content & Course Control', desc: 'Manage batches, live classes, and study materials' },
                            { title: 'Reports & Analytics', desc: 'Real-time insights and performance metrics' },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-3 text-white/90">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-white/70">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-white/60 text-sm">© 2024 ExamEdge Academy. All rights reserved.</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">ExamEdge</h1>
                        </div>
                        <p className="text-gray-600">Admin Portal</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                            <p className="text-gray-600">Sign in to access your admin dashboard</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-800 font-medium">Login Failed</p>
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@examedge.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 text-base font-semibold"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Test Credentials hint */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">Test Credentials:</p>
                            <p className="text-sm text-blue-800"><strong>Email:</strong> admin@demo.com | <strong>Password:</strong> Demo123!@</p>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">🔒 Secured with bcrypt encryption</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
