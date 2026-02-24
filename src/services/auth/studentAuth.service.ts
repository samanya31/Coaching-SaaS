import { supabase } from '@/config/supabase';

/**
 * Send OTP to student's phone
 */
export async function sendOTP(phone: string) {
    const { error } = await supabase.auth.signInWithOtp({
        phone,
    });

    if (error) throw error;
    return true;
}

/**
 * Verify OTP and login
 * 🚨 DOES NOT auto-create profile - admin must create accounts
 */
export async function verifyOTPAndLogin(
    phone: string,
    otp: string,
    coachingId: string
) {
    // Step 1: Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
    });

    if (error) throw error;
    if (!data.user) throw new Error('OTP verification failed');

    // Step 2: Fetch profile
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    // 🔴 CRITICAL: If no profile, deny access
    if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error('Your account is not registered with this institute. Contact admin.');
    }

    // 🔴 CRITICAL: Institute isolation check
    if (profile.coaching_id !== coachingId) {
        await supabase.auth.signOut();
        throw new Error('Wrong institute. Please use the correct login portal.');
    }

    return { user: data.user, profile };
}

/**
 * Update student profile (onboarding)
 */
export async function updateStudentProfile(userId: string, data: {
    full_name: string;
    exam_goal?: string;
    language?: string;
}) {
    const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);

    if (error) throw error;
}

/**
 * Get current session and profile
 */
export async function getCurrentStudent() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return profile;
}

/**
 * Logout student
 */
export async function logoutStudent() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}
