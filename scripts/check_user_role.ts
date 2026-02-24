
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qciqdzdvpbzljabqcodg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error('Supabase key not found');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', 'e2c7730c-f1c8-4d58-af73-dc43a8f18d04')
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('User Role Data:', data);
    }
}

checkUser();
