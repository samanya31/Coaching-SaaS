import { S3Client, DeleteObjectCommand } from "npm:@aws-sdk/client-s3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { publicUrl } = await req.json();

        if (!publicUrl) {
            return new Response(JSON.stringify({ error: "Missing publicUrl" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // --- R2 credentials ---
        const accountId = Deno.env.get("R2_ACCOUNT_ID")!;
        const accessKey = Deno.env.get("R2_ACCESS_KEY_ID")!;
        const secretKey = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
        const bucket = Deno.env.get("R2_BUCKET_NAME") ?? "exam-edge-media";
        const publicBase = Deno.env.get("R2_PUBLIC_URL")!;

        // --- Extract Key from Public URL ---
        // Public URL format: https://pub-xxx.r2.dev/institutes/abc/category/file.mp4
        // We need: institutes/abc/category/file.mp4
        const url = new URL(publicUrl);
        const key = decodeURIComponent(url.pathname.substring(1));

        if (!key) {
            throw new Error("Could not extract R2 key from URL");
        }

        const client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        });

        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        await client.send(command);

        return new Response(
            JSON.stringify({ success: true, message: `Deleted ${key}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("[r2-delete]", err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
