import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export interface StoragePerCoaching {
    coaching_id: string;
    coaching_name: string;
    slug: string;
    plan: string;
    total_bytes: number;
    total_files: number;
    orphan_files: number;
    last_upload_at: string | null;
    plan_limit_gb: number;
    used_gb: number;
    used_pct: number;   // 0-100
}

export interface StorageSummary {
    totalBytes: number;
    totalFiles: number;
    totalOrphans: number;
    bucketBreakdown: { bucket: string; bytes: number; files: number }[];
    top10: StoragePerCoaching[];
    all: StoragePerCoaching[];
}

const GB = 1024 * 1024 * 1024;

const fmtSize = (bytes: number) => {
    if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
};
export { fmtSize };

const fetchStorageStats = async (): Promise<StorageSummary> => {
    // 1. All coachings with plan limit
    const { data: coachings, error: cErr } = await supabase
        .from('coachings')
        .select('id, name, slug, plan, plan_id, saas_plans(max_storage_gb)')
        .order('name');

    if (cErr) throw cErr;

    // 2. Storage summary per (coaching_id, category) — real data from R2 uploads
    const { data: storageRows, error: sErr } = await supabase
        .from('coaching_storage_summary')
        .select('coaching_id, category, file_count, total_bytes');

    if (sErr) throw sErr;

    // 3. Latest upload per coaching
    const { data: latestUploads } = await supabase
        .from('media_files')
        .select('coaching_id, created_at')
        .order('created_at', { ascending: false });

    // Build lookup maps
    type CoachingAgg = { bytes: number; files: number; lastAt: string | null };
    const coachingAgg: Record<string, CoachingAgg> = {};
    const bucketMap: Record<string, { bytes: number; files: number }> = {};

    (storageRows || []).forEach((r: any) => {
        const cid = r.coaching_id;
        const bytes = Number(r.total_bytes || 0);
        const files = Number(r.file_count || 0);
        const cat = r.category || 'other';

        if (!coachingAgg[cid]) coachingAgg[cid] = { bytes: 0, files: 0, lastAt: null };
        coachingAgg[cid].bytes += bytes;
        coachingAgg[cid].files += files;

        if (!bucketMap[cat]) bucketMap[cat] = { bytes: 0, files: 0 };
        bucketMap[cat].bytes += bytes;
        bucketMap[cat].files += files;
    });

    // Attach last upload per coaching
    (latestUploads || []).forEach((r: any) => {
        const cid = r.coaching_id;
        if (coachingAgg[cid] && !coachingAgg[cid].lastAt) {
            coachingAgg[cid].lastAt = r.created_at;
        }
    });

    // Build per-coaching rows
    const rows: StoragePerCoaching[] = (coachings || []).map((c: any) => {
        const agg = coachingAgg[c.id] || { bytes: 0, files: 0, lastAt: null };
        const limitGb = c.saas_plans?.max_storage_gb ?? 5;
        const usedGb = agg.bytes / GB;
        return {
            coaching_id: c.id,
            coaching_name: c.name,
            slug: c.slug,
            plan: c.plan || 'free',
            total_bytes: agg.bytes,
            total_files: agg.files,
            orphan_files: 0,    // future: detect via entity reference check
            last_upload_at: agg.lastAt,
            plan_limit_gb: limitGb,
            used_gb: usedGb,
            used_pct: Math.min(100, (usedGb / limitGb) * 100),
        };
    }).sort((a, b) => b.total_bytes - a.total_bytes);

    const bucketBreakdown = Object.entries(bucketMap).map(([bucket, v]) => ({
        bucket,
        bytes: v.bytes,
        files: v.files,
    }));

    return {
        totalBytes: rows.reduce((s, r) => s + r.total_bytes, 0),
        totalFiles: rows.reduce((s, r) => s + r.total_files, 0),
        totalOrphans: 0,
        bucketBreakdown,
        top10: rows.slice(0, 10),
        all: rows,
    };
};

export const useStorageStats = () =>
    useQuery({
        queryKey: ['superadmin-storage'],
        queryFn: fetchStorageStats,
        staleTime: 60_000,
    });
