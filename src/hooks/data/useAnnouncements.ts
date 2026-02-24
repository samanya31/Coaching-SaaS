import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { announcementService, Announcement } from '@/services/api/announcement.service';

/**
 * Query Keys for Announcements
 */
export const announcementKeys = {
    all: (coachingId: string) => ['announcements', coachingId] as const,
    filtered: (coachingId: string, filters: any) => ['announcements', coachingId, filters] as const,
    detail: (announcementId: string) => ['announcements', 'detail', announcementId] as const,
    pinned: (coachingId: string) => ['announcements', coachingId, 'pinned'] as const,
};

/**
 * Get all announcements for current coaching
 */
export function useAnnouncements(filters?: {
    type?: string;
    isPinned?: boolean;
}) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: filters
            ? announcementKeys.filtered(coachingId!, filters)
            : announcementKeys.all(coachingId!),
        queryFn: () => announcementService.getAnnouncements(coachingId!, filters),
        enabled: !!coachingId,
    });
}

/**
 * Get pinned announcements only
 */
export function usePinnedAnnouncements() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: announcementKeys.pinned(coachingId!),
        queryFn: () => announcementService.getAnnouncements(coachingId!, { isPinned: true }),
        enabled: !!coachingId,
    });
}

/**
 * Get a single announcement by ID
 */
export function useAnnouncement(announcementId: string | undefined) {
    return useQuery({
        queryKey: announcementKeys.detail(announcementId!),
        queryFn: () => announcementService.getAnnouncementById(announcementId!),
        enabled: !!announcementId,
    });
}

/**
 * Create a new announcement
 */
export function useCreateAnnouncement() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (announcementData: Partial<Announcement>) =>
            announcementService.createAnnouncement({ ...announcementData, coaching_id: coachingId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.all(coachingId!) });
        },
    });
}

/**
 * Update an announcement
 */
export function useUpdateAnnouncement() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ announcementId, updates }: { announcementId: string; updates: Partial<Announcement> }) =>
            announcementService.updateAnnouncement(announcementId, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: announcementKeys.all(coachingId!) });
        },
    });
}

/**
 * Delete an announcement
 */
export function useDeleteAnnouncement() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (announcementId: string) => announcementService.deleteAnnouncement(announcementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.all(coachingId!) });
        },
    });
}

/**
 * Toggle pin status of an announcement
 */
export function useTogglePin() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ announcementId, isPinned }: { announcementId: string; isPinned: boolean }) =>
            announcementService.togglePin(announcementId, isPinned),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: announcementKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: announcementKeys.all(coachingId!) });
            queryClient.invalidateQueries({ queryKey: announcementKeys.pinned(coachingId!) });
        },
    });
}
