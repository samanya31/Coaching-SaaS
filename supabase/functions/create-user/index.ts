import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
    console.log('🚀 Function called, method:', req.method)

    // Handle CORS
    if (req.method === 'OPTIONS') {
        console.log('✅ CORS preflight handled')
        return new Response('ok', { status: 200, headers: corsHeaders })
    }

    try {
        console.log('📥 Getting environment variables...')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        console.log('🔧 Environment check:', {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey
        })

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ Missing environment variables')
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('🔐 Creating admin client...')
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        console.log('📦 Parsing request body...')
        const body = await req.json()
        const { email, password, full_name, role, role_id, coaching_id } = body

        console.log('📋 Request data:', {
            email,
            hasPassword: !!password,
            full_name,
            role,
            coaching_id
        })

        if (!email || !password || !coaching_id) {
            console.error('❌ Missing required fields')
            return new Response(
                JSON.stringify({ error: 'Missing required fields: email, password, coaching_id' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('👤 Creating user:', email)
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                role: role || 'teacher',
                role_id,
                coaching_id
            }
        })

        if (error) {
            console.error('❌ User creation error:', error)
            throw error
        }

        console.log('✅ User created successfully:', data.user.id)
        return new Response(
            JSON.stringify({ success: true, user: data.user }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('💥 Function error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
