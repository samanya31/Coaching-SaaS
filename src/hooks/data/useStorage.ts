import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import r2 from '@/services/r2.service';

export interface StorageSummaryRow {
    coaching_id: string;
    category: string;
    file_count: number;
    total_bytes: number;
    total_mb: number;
}

export interface MediaFile {
    id: string;
    coaching_id: string;
    uploaded_by: string | null;
    file_name: string;
    file_size: number;
    mime_type: string | null;
    category: string;
    sub_folder: string | null;
    r2_key: string;
    public_url: string;
    entity_type: string | null;
    entity_id: string | null;
    created_at: string;
}

const FORMAT_CATEGORY: Record<string, string> = {
    videos: '🎬 Videos',
    thumbnails: '🖼️ Thumbnails',
    materials: '📄 Materials',
    logos: '🏷️ Logos',
    avatars: '👤 Avatars',
    banners: '🎨 Banners',
};

export const useCategoryLabel = (cat: string) => FORMAT_CATEGORY[cat] ?? cat;

export function useStorageSummary() {
    const { coachingId } = useTenant();
    return useQuery<StorageSummaryRow[]>({
        queryKey: ['storage-summary', coachingId],
        queryFn: () => r2.getStorageSummary(coachingId!),
        enabled: !!coachingId,
        staleTime: 30_000,
    });
}

export function useRecentUploads(limit = 50) {
    const { coachingId } = useTenant();
    return useQuery<MediaFile[]>({
        queryKey: ['recent-uploads', coachingId, limit],
        queryFn: () => r2.getRecentUploads(coachingId!, limit),
        enabled: !!coachingId,
        staleTime: 30_000,
    });
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(2)} GB`;
}
