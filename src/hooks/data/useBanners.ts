import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { bannerService } from '@/services/api/banner.service';
import { Banner } from '@/types/banner';

export const bannerKeys = {
    all: (coachingId: string) => ['banners', coachingId] as const,
    detail: (id: string) => ['banners', 'detail', id] as const,
};

/**
 * Hook to fetch all banners
 */
export function useBanners(activeOnly: boolean = false) {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: [...bannerKeys.all(coachingId!), activeOnly],
        queryFn: () => bannerService.getBanners(coachingId!, activeOnly),
        enabled: !!coachingId,
    });
}

/**
 * Hook to fetch a single banner
 */
export function useBanner(bannerId: string) {
    return useQuery({
        queryKey: bannerKeys.detail(bannerId),
        queryFn: () => bannerService.getBannerById(bannerId),
        enabled: !!bannerId,
    });
}

/**
 * Hook to create a banner
 */
export function useCreateBanner() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (bannerData: Partial<Banner>) =>
            bannerService.createBanner({ ...bannerData, coaching_id: coachingId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bannerKeys.all(coachingId!) });
        },
    });
}

/**
 * Hook to update a banner
 */
export function useUpdateBanner() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ bannerId, updates }: { bannerId: string; updates: Partial<Banner> }) =>
            bannerService.updateBanner(bannerId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bannerKeys.all(coachingId!) });
        },
    });
}

/**
 * Hook to delete a banner
 */
export function useDeleteBanner() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (bannerId: string) => bannerService.deleteBanner(bannerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bannerKeys.all(coachingId!) });
        },
    });
}

/**
 * Hook to toggle banner status
 */
export function useToggleBannerStatus() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ bannerId, isActive }: { bannerId: string; isActive: boolean }) =>
            bannerService.toggleBannerStatus(bannerId, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bannerKeys.all(coachingId!) });
        },
    });
}
