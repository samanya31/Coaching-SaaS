import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // --- Parse request body ---
        const { path, contentType } = await req.json() as {
            path: string;       // e.g. "institutes/inst_abc/videos/course_jee/intro.mp4"
            contentType: string; // e.g. "video/mp4"
        };

        if (!path || !contentType) {
            return new Response(JSON.stringify({ error: "Missing path or contentType" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // --- R2 credentials from Supabase secrets ---
        const accountId = Deno.env.get("R2_ACCOUNT_ID")!;
        const accessKey = Deno.env.get("R2_ACCESS_KEY_ID")!;
        const secretKey = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
        const bucket = Deno.env.get("R2_BUCKET_NAME") ?? "exam-edge-media";
        const publicBase = Deno.env.get("R2_PUBLIC_URL")!;

        // --- Build S3-compatible R2 client ---
        // IMPORTANT: Set requestChecksumCalculation to "WHEN_REQUIRED" to prevent
        // AWS SDK v3 from adding CRC32 checksum headers (x-amz-checksum-crc32) that
        // Cloudflare R2 doesn't support — this was causing video uploads to hang at 90%.
        const client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
            requestChecksumCalculation: "WHEN_REQUIRED",
        });

        // --- Generate presigned PUT URL (15 min expiry) ---
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: path,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(client, command, {
            expiresIn: 900,
            // Exclude checksum headers from the signed URL — R2 rejects them
            unhoistableHeaders: new Set(["x-amz-checksum-crc32", "x-amz-sdk-checksum-algorithm"]),
        });

        const publicUrl = `${publicBase}/${path}`;

        return new Response(
            JSON.stringify({ uploadUrl, publicUrl }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err) {
        console.error("[r2-upload-url]", err);
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
