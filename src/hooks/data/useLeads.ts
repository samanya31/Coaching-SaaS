import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/providers/TenantProvider';
import { leadService } from '@/services/api/lead.service';
import { Lead } from '@/types/lead';

export const leadKeys = {
    all: (coachingId: string) => ['leads', coachingId] as const,
};

export function useLeads() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: leadKeys.all(coachingId!),
        queryFn: () => leadService.getLeads(coachingId!),
        enabled: !!coachingId,
    });
}

export function useCreateLead() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (lead: Partial<Lead>) => leadService.createLead({ ...lead, coaching_id: coachingId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadKeys.all(coachingId!) });
        },
    });
}

export function useUpdateLeadStatus() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
            leadService.updateLeadStatus(leadId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadKeys.all(coachingId!) });
        },
    });
}

export function useDeleteLead() {
    const queryClient = useQueryClient();
    const { coachingId } = useTenant();

    return useMutation({
        mutationFn: (leadId: string) => leadService.deleteLead(leadId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: leadKeys.all(coachingId!) });
        },
    });
}
