import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// base64url encode (standard for JWT — uses - and _ instead of + and /)
function base64url(data: string | Uint8Array): string {
    let b64: string;
    if (typeof data === 'string') {
        b64 = btoa(data);
    } else {
        b64 = btoa(String.fromCharCode(...data));
    }
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Generate a proper HS256 JWT for the Zoom Meeting SDK
async function generateZoomJWT(sdkKey: string, sdkSecret: string, meetingNumber: string, role: number): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 2; // 2 hour expiry

    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
        sdkKey,
        appKey: sdkKey,  // some SDK versions require appKey
        mn: meetingNumber,
        role,
        iat: now,
        exp,
        tokenExp: exp,
    };

    const headerEncoded = base64url(JSON.stringify(header));
    const payloadEncoded = base64url(JSON.stringify(payload));
    const signingInput = `${headerEncoded}.${payloadEncoded}`;

    // HMAC-SHA256 using Web Crypto API (Deno-native, no Buffer required)
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(sdkSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signingInput));
    const signatureEncoded = base64url(new Uint8Array(sig));

    return `${signingInput}.${signatureEncoded}`;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { meetingNumber, role } = await req.json();

        if (!meetingNumber || role === undefined) {
            return new Response(
                JSON.stringify({ error: "meetingNumber and role are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Read global Zoom SDK credentials from platform_settings (uses service role — safe)
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { data: platform, error } = await supabase
            .from("platform_settings")
            .select("settings")
            .eq("id", "global")
            .single();

        if (error || !platform?.settings?.zoom_sdk_key || !platform?.settings?.zoom_sdk_secret) {
            return new Response(
                JSON.stringify({ error: "Zoom SDK not configured. Please ask the admin to configure Zoom SDK credentials in Superadmin → Settings." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const sdkKey = platform.settings.zoom_sdk_key as string;
        const sdkSecret = platform.settings.zoom_sdk_secret as string;

        // Generate a proper Zoom Meeting SDK JWT (HS256)
        const signature = await generateZoomJWT(sdkKey, sdkSecret, meetingNumber.toString(), Number(role));

        return new Response(
            JSON.stringify({ signature, sdkKey }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("zoom-signature error:", err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
