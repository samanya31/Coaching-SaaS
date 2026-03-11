import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { SaasPlan } from './useSaasPlans';

/**
 * Reads the current coaching's plan from saas_plans via coachings.plan_id.
 * Returns null if no plan is assigned (treat as free/unlimited for now).
 */
const fetchPlan = async (coachingId: string): Promise<SaasPlan | null> => {
    // Get plan_id from coachings
    const { data: coaching, error: cErr } = await supabase
        .from('coachings')
        .select('plan_id')
        .eq('id', coachingId)
        .maybeSingle();

    if (cErr || !coaching?.plan_id) return null;

    // Get plan details
    const { data: plan, error: pErr } = await supabase
        .from('saas_plans')
        .select('*')
        .eq('id', coaching.plan_id)
        .maybeSingle();

    if (pErr || !plan) return null;
    return plan as SaasPlan;
};

export const usePlan = (coachingId: string | null | undefined) =>
    useQuery({
        queryKey: ['coaching-plan', coachingId],
        queryFn: () => fetchPlan(coachingId!),
        enabled: !!coachingId,
        staleTime: 5 * 60_000,  // cache for 5 minutes
    });

/**
 * Convenience hook: returns strongly-typed feature flags.
 * If no plan is assigned, defaults to ALL features enabled (no restrictions).
 */
export const usePlanFeatures = (coachingId: string | null | undefined) => {
    const { data: plan, isLoading } = usePlan(coachingId);

    // No plan = restrictive default (or legacy free tier)
    const noPlan = !plan;

    return {
        isLoading,
        plan,
        // Feature flags — true if plan allows it
        canUseLiveClasses: !noPlan && plan.live_classes,
        canUseTests: !noPlan && plan.tests_enabled,
        canUsePayments: !noPlan && plan.payments_enabled,
        canUseFinance: !noPlan && plan.payments_enabled, // Alias for Finance
        canUseReports: !noPlan && plan.reports_enabled,
        canUseCustomDomain: !noPlan && plan.custom_domain,
        canUseBanners: !noPlan && plan.banners_enabled,
        canUseBranding: !noPlan && plan.branding_enabled,
        // Limits
        maxStudents: plan?.max_students ?? 100, // Safe default for free tier
        maxStorageGb: plan?.max_storage_gb ?? 5,
        // Helpers
        planName: plan?.name ?? 'No Plan',
        planSlug: plan?.slug ?? 'none',
    };
};
