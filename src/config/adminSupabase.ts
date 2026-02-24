/**
 * Admin-only Supabase client.
 * Uses persistSession: false and autoRefreshToken: false so it NEVER acquires
 * the Navigator Lock or tries to refresh tokens. This prevents the AbortError
 * that occurs when the main supabase client's auth initialization conflicts
 * with admin login DB queries.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
}

export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'admin-supabase-no-session',
    },
});
