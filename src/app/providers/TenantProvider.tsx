import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/config/supabase';
import { Coaching } from '@/types/coaching';

interface TenantContextType {
    coaching: Coaching | null;
    coachingId: string | null;
    isLoading: boolean;
    error: Error | null;
    refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [coaching, setCoaching] = useState<Coaching | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadTenant = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // TENANT DETECTION LOGIC — Route-Aware
            // On /admin/* routes  → use adminUser from localStorage
            // On /student/* routes → use studentUser from localStorage
            // Fallback: ?tenant=slug URL param, then 'demo-coaching'

            const isAdminRoute = window.location.pathname.startsWith('/admin');
            const isStudentRoute = window.location.pathname.startsWith('/student');

            const adminUserStr = localStorage.getItem('adminUser');
            const studentUserStr = localStorage.getItem('studentUser');
            let tenantSlug = 'demo-coaching'; // Ultimate fallback

            // On student routes with NO logged-in student and NO explicit tenant param,
            // do NOT force the "demo-coaching" tenant. This avoids the brief flash of
            // the demo coaching UI on student login/logout.
            if (isStudentRoute && !studentUserStr) {
                const params = new URLSearchParams(window.location.search);
                if (!params.get('tenant')) {
                    setCoaching(null);
                    setIsLoading(false);
                    return;
                }
            }

            if (isAdminRoute && adminUserStr) {
                // Admin portal — use admin user's coaching
                try {
                    const adminUser = JSON.parse(adminUserStr);
                    if (adminUser.coachingSlug) {
                        tenantSlug = adminUser.coachingSlug;
                    }
                } catch (e) {
                    console.error('[TenantProvider] Error parsing admin user:', e);
                }
            } else if (isStudentRoute && studentUserStr) {
                // Student portal — use student user's coaching
                try {
                    const studentUser = JSON.parse(studentUserStr);
                    if (studentUser.coachingSlug) {
                        tenantSlug = studentUser.coachingSlug;
                    } else if (studentUser.id) {
                        // Old session without coachingSlug — fetch from DB
                        const { data: userRow } = await supabase
                            .from('users')
                            .select('coaching_id, coachings(slug)')
                            .eq('id', studentUser.id)
                            .maybeSingle();
                        if (userRow?.coachings && (userRow.coachings as any).slug) {
                            tenantSlug = (userRow.coachings as any).slug;
                            // Backfill into localStorage for future fast loads
                            localStorage.setItem('studentUser', JSON.stringify({
                                ...studentUser,
                                coachingSlug: tenantSlug
                            }));
                        }
                    }
                } catch (e) {
                    console.error('[TenantProvider] Error parsing student user:', e);
                }
            } else {
                // No logged-in user or unknown route — try URL param
                const params = new URLSearchParams(window.location.search);
                if (params.get('tenant')) {
                    tenantSlug = params.get('tenant')!;
                } else if (!isStudentRoute && adminUserStr) {
                    // Non-student route with an admin session (e.g. homepage)
                    try {
                        const adminUser = JSON.parse(adminUserStr);
                        if (adminUser.coachingSlug) tenantSlug = adminUser.coachingSlug;
                    } catch (_) { }
                }
            }

            // Fetch coaching from Supabase
            const { data, error: fetchError } = await supabase
                .from('coachings')
                .select('*')
                .eq('slug', tenantSlug)
                .eq('status', 'active')
                .single();

            if (fetchError) {
                console.error('[TenantProvider] Error fetching coaching:', fetchError);
                throw new Error(`Failed to load coaching: ${fetchError.message}`);
            }

            if (!data) {
                throw new Error(`Coaching not found: ${tenantSlug}`);
            }

            setCoaching(data);

        } catch (err) {
            // Silently ignore AbortErrors (component unmounted during fetch)
            if (err instanceof Error && err.name === 'AbortError') return;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.warn('[TenantProvider] Could not load coaching:', errorMessage);
            setError(err instanceof Error ? err : new Error(errorMessage));
        } finally {
            setIsLoading(false);
        }
    };

    // Load tenant on mount only — TenantProvider mounts fresh on each route
    // (No popstate listener needed — that was causing an infinite re-render loop)
    useEffect(() => {
        loadTenant();
    }, []);

    const value: TenantContextType = {
        coaching,
        coachingId: coaching?.id || null,
        isLoading,
        error,
        refreshTenant: loadTenant
    };

    // Always render children — pages handle null coaching gracefully
    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
};
