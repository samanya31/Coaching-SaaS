import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Get the User from the Authorization header (to ensure they are an admin)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(
            authHeader.replace('Bearer ', '')
        )

        if (userError || !caller) {
            throw new Error('Invalid token')
        }

        // Parse request body
        const { user_id, new_password } = await req.json()

        if (!user_id || !new_password) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: user_id, new_password' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (new_password.length < 6) {
            return new Response(
                JSON.stringify({ error: 'Password must be at least 6 characters long' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Reset the user's password
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            user_id,
            { password: new_password }
        )

        if (error) throw error

        return new Response(
            JSON.stringify({ success: true, message: 'Password reset successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
