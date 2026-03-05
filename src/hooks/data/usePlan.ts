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

    // No plan = no restriction (free tier / legacy)
    const noPlan = !plan;

    return {
        isLoading,
        plan,
        // Feature flags — true if plan allows it (or no plan assigned)
        canUseLiveClasses: noPlan || plan.live_classes,
        canUseTests: noPlan || plan.tests_enabled,
        canUsePayments: noPlan || plan.payments_enabled,
        canUseCustomDomain: noPlan || plan.custom_domain,
        canUseBranding: true, // TODO: Tie this to a specific db column on saas_plans if needed (e.g. `plan.branding_enabled`), for now it's a feature flag that's always on.
        // Limits
        maxStudents: plan?.max_students ?? Infinity,
        maxStorageGb: plan?.max_storage_gb ?? Infinity,
        // Helpers
        planName: plan?.name ?? 'Free',
        planSlug: plan?.slug ?? 'free',
    };
};
