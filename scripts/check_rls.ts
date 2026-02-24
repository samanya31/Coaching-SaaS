
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

async function checkRLS() {
    console.log('Attempting to fetch ALL users with ANON key...');
    const { data, error } = await supabase
        .from('users')
        .select('id, role, email')
        .limit(5);

    if (error) {
        console.error('RLS Check Failed (Good):', error.message);
    } else {
        console.log('RLS Check Succeeded (BAD):', data);
        if (data && data.length > 0) {
            console.error('CRITICAL: Users table is publicly readable!');
        } else {
            console.log('Table seems empty or restricted (0 rows returned).');
        }
    }
}

checkRLS();
