import { supabase } from '@/config/supabase';

/**
 * Create student account with email+password (Admin only)
 * Uses Postgres function to bypass client-side auth.admin restrictions
 * 1. Generate email from phone + coaching subdomain
 * 2. Call RPC function to create auth user + profile
 * 3. Enroll in batch (handled by function)
 * 4. Return credentials for admin to share with student
 */
export async function createStudentAccount(data: {
    phone: string;
    full_name: string;
    coaching_id: string;
    coaching_subdomain: string; // e.g., 'abc', 'demo'
    password: string;
    batch_id?: string;
    exam_goal?: string;
    address: string;
    personal_email?: string;
}) {
    // Step 1: Generate email
    const phoneDigits = data.phone.replace(/\D/g, ''); // Remove non-digits
    const email = `student${phoneDigits}@${data.coaching_subdomain}.edu`;

    // Step 2: Call Postgres function to create student
    const { data: result, error } = await supabase.rpc('create_student_account', {
        p_email: email,
        p_password: data.password || phoneDigits, // Default to phone if empty
        p_phone: data.phone,
        p_full_name: data.full_name,
        p_coaching_id: data.coaching_id,
        p_exam_goal: data.exam_goal || null,
        p_batch_id: data.batch_id || null,
        p_address: data.address || null,
        p_personal_email: data.personal_email || null
    });

    if (error) {
        console.error('RPC Error:', error);
        throw new Error(error.message || 'Failed to create student account');
    }

    if (!result || !result.success) {
        throw new Error(result?.error || 'Failed to create student account');
    }

    // Return credentials
    return {
        user: {
            id: result.user_id,
            email: email
        },
        credentials: {
            email,
            password: data.password || phoneDigits
        }
    };
}

/**
 * Delete student account (Admin only)
 * Deletes both auth user and profile (CASCADE will handle enrollments)
 */
export async function deleteStudentAccount(userId: string) {
    // Delete from users table (CASCADE handles related data)
    const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (profileError) throw profileError;

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw authError;
}
