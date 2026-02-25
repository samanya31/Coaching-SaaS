import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string;   // URL of uploaded profile photo (student-avatars bucket)
    phone?: string;
    address?: string;
    personal_email?: string;
    city?: string;
    class_name?: string;
    board?: string;
    exam_goal?: string;
    language?: string;
    coachingSlug?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithPhone: (phone: string) => Promise<boolean>;
    sendOtp: (phone: string) => Promise<boolean>;
    verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser: boolean }>;
    registerUser: (details: { name: string; language: string; course: string; phone: string }) => Promise<boolean>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // On mount: restore user from localStorage only (no Supabase Auth calls)
    useEffect(() => {
        const initAuth = async () => {
            try {
                        const storedUser = localStorage.getItem('studentUser');
                        if (storedUser) {
                            const parsed = JSON.parse(storedUser);
                            if (parsed?.id) {
                                setUser(parsed);

                                // Check if we also have a Supabase session (required for RLS)
                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session) {
                                    console.warn('Student restored from localStorage but no Supabase session found. Clearing stale session and forcing re-login.');
                                    // Clear stale local session so the app doesn't run with broken RLS permissions
                                    setUser(null);
                                    localStorage.removeItem('studentUser');
                                } else {
                                    console.log('✅ Student session recovered with Supabase JWT.');
                                }
                            }
                        }
            } catch (e) {
                console.error('Auth initialization error:', e);
                localStorage.removeItem('studentUser');
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    // Helper function to try Supabase Auth as fallback
    const trySupabaseAuth = async (email: string, password: string): Promise<boolean> => {
        try {
            console.log('Trying Supabase Auth fallback...');
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError || !authData.user) {
                console.warn('Supabase Auth failed:', authError?.message);
                return false;
            }

            // Fetch user profile from users table
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .maybeSingle();

            if (profileError || !profile) {
                await supabase.auth.signOut();
                console.warn('Profile not found for authenticated user');
                return false;
            }

            // Success! Set session
            const authUser: User = {
                id: profile.id,
                name: profile.full_name || profile.email,
                email: profile.email,
                avatar: profile.avatar,
                avatar_url: profile.avatar_url || null,
                phone: profile.phone,
                address: profile.address,
                personal_email: profile.personal_email,
                city: profile.city,
                class_name: profile.class_name,
                board: profile.board,
                exam_goal: profile.exam_goal,
                language: profile.language,
                coachingSlug: profile.coachings?.slug
            };
            setUser(authUser);
            localStorage.setItem('studentUser', JSON.stringify(authUser));
            console.log('✅ Supabase Auth successful!');
            return true;
        } catch (err) {
            console.error('Supabase Auth exception:', err);
            return false;
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // 1. Lookup user in public.users (Custom Auth Flow)
            const { data: user, error } = await supabase
                .from('users')
                .select('*, coachings(id, name, slug)')
                .ilike('email', email)
                .maybeSingle();

            if (error || !user) {
                console.warn('Login: User not found or DB error', error);
                // Try Supabase Auth as fallback
                return await trySupabaseAuth(email, password);
            }

            // 2. Verify Password (Bcrypt) if password_hash exists
            if (user.password_hash) {
                const bcrypt = await import('bcryptjs');
                const match = await bcrypt.compare(password, user.password_hash);

                if (match) {
                    // Success! Set custom session
                    const authUser: User = {
                        id: user.id,
                        name: user.full_name || user.email,
                        email: user.email,
                        avatar: user.avatar,
                        avatar_url: user.avatar_url || null,
                        phone: user.phone,
                        address: user.address,
                        personal_email: user.personal_email,
                        city: user.city,
                        class_name: user.class_name,
                        board: user.board,
                        exam_goal: user.exam_goal,
                        language: user.language,
                        coachingSlug: user.coachings?.slug
                    };
                    setUser(authUser);
                    localStorage.setItem('studentUser', JSON.stringify(authUser));

                    // Also establish a Supabase Auth session so RLS policies work (required for Data/Tests).
                    // bcrypt auth alone doesn't create a JWT — without it all DB queries return 401.
                    try {
                        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

                        if (signInErr) {
                            console.log('Supabase sign-in failed during bcrypt login, attempting session repair (signUp)...');
                            // If sign-in fails, they might not have an auth.users entry yet (Admin created).
                            // signUp will create it and log them in simultaneously.
                            const { error: signUpErr } = await supabase.auth.signUp({
                                email,
                                password,
                                options: {
                                    data: { full_name: authUser.name, role: 'student' }
                                }
                            });

                            if (signUpErr) {
                                console.warn('Supabase Auth session repair failed:', signUpErr.message);
                                // If already registered with different password, we can't do much without Edge Functions.
                            } else {
                                console.log('✅ Supabase Auth session repaired (signUp successful).');
                            }
                        } else {
                            console.log('✅ Supabase Auth session established via signIn.');
                        }
                    } catch (err) {
                        console.error('Supabase Auth sync exception:', err);
                    }

                    return true;
                }
                // password_hash exists but didn't match — do NOT fall back to Supabase Auth.
                return false;
            }

            // 3. Fallback: If no password_hash, try Supabase Auth
            return await trySupabaseAuth(email, password);

        } catch (err) {
            console.error('Login exception:', err);
            return false;
        }
    };

    const sendOtp = async (phone: string): Promise<boolean> => {
        console.log(`Sending OTP to ${phone}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
    };

    const verifyOtp = async (phone: string, otp: string): Promise<{ success: boolean; isNewUser: boolean }> => {
        console.log(`Verifying OTP ${otp} for ${phone}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (otp === '1234') {
            const mockUser: User = {
                id: 'mock-phone-id-' + Date.now(),
                name: 'Phone User',
                email: `${phone}@example.com`,
                phone: phone
            };
            setUser(mockUser);
            localStorage.setItem('studentUser', JSON.stringify(mockUser));
            return { success: true, isNewUser: false };
        }
        return { success: false, isNewUser: false };
    };

    const registerUser = async (_details: { name: string; language: string; course: string; phone: string }): Promise<boolean> => {
        return true;
    };

    const loginWithPhone = async (phone: string): Promise<boolean> => {
        return sendOtp(phone);
    };

    const updateProfile = async (updates: Partial<User>): Promise<void> => {
        if (!user) return;

        // Prepare update object - only include defined values (only fields that exist in users table)
        const updateData: any = {};
        if (updates.name !== undefined) updateData.full_name = updates.name;
        if (updates.phone !== undefined) updateData.phone = updates.phone;
        if (updates.address !== undefined) updateData.address = updates.address;
        if (updates.personal_email !== undefined) updateData.personal_email = updates.personal_email;
        if (updates.exam_goal !== undefined) updateData.exam_goal = updates.exam_goal;
        if (updates.language !== undefined) updateData.language = updates.language;

        // Update in Supabase
        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);

        if (error) {
            console.error('Profile update error:', error);
            throw error;
        }

        // Update local state and storage - map phone correctly
        const updatedUser: User = {
            ...user,
            name: updates.name ?? user.name,
            phone: updates.phone ?? user.phone,
            address: updates.address ?? user.address,
            personal_email: updates.personal_email ?? user.personal_email,
            exam_goal: updates.exam_goal ?? user.exam_goal,
            language: updates.language ?? user.language,
        };
        setUser(updatedUser);
        localStorage.setItem('studentUser', JSON.stringify(updatedUser));
    };

    const logout = async (): Promise<void> => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            // Ignore signOut errors (e.g. no session)
        }
        setUser(null);
        localStorage.removeItem('studentUser');
        navigate('/student/login');
    };

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        loginWithPhone,
        sendOtp,
        verifyOtp,
        registerUser,
        updateProfile,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
