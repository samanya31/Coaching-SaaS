import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

        // Read global Zoom SDK credentials from platform_settings
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
                JSON.stringify({ error: "Zoom SDK not configured. Please contact the platform administrator." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const sdkKey = platform.settings.zoom_sdk_key as string;
        const sdkSecret = platform.settings.zoom_sdk_secret as string;

        // Generate Zoom SDK signature (HMAC-SHA256)
        const timestamp = new Date().getTime() - 30000;
        const msg = Buffer.from(`${sdkKey}${meetingNumber}${timestamp}${role}`).toString("base64");
        const hash = createHmac("sha256", sdkSecret).update(msg).digest("base64");
        const signature = Buffer.from(`${sdkKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString("base64");

        return new Response(
            JSON.stringify({ signature, sdkKey }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
