import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useTenant } from '@/app/providers/TenantProvider';

export interface ExamGoal {
    id: string;
    name: string;
    icon: string;
}

/**
 * Fetches exam goals configured by the coaching admin for this institute.
 * Returns only goals with coaching_id matching the current tenant.
 */
export const useExamGoals = () => {
    const { coachingId } = useTenant();
    const [examGoals, setExamGoals] = useState<ExamGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!coachingId) {
                setIsLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('exam_goals')
                    .select('id, name, icon')
                    .eq('coaching_id', coachingId)
                    .order('name', { ascending: true });

                if (error) throw error;
                setExamGoals(data || []);
            } catch (err) {
                console.error('Failed to fetch exam goals:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [coachingId]);

    return { examGoals, isLoading };
};
