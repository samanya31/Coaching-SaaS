import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/config/supabase';

interface ExamGoal {
    id: string;
    name: string;
    icon: string;
    color: string;
}

interface ExamGoalContextType {
    selectedGoal: ExamGoal;
    setSelectedGoal: (goal: ExamGoal) => void;
    availableGoals: ExamGoal[];
    isGoalSelectorOpen: boolean;
    openGoalSelector: () => void;
    closeGoalSelector: () => void;
    isLoading: boolean;
}

// Fallback defaults
const defaultExamGoals: ExamGoal[] = [
    { id: 'JEE', name: 'IIT-JEE', icon: '⚛️', color: 'from-blue-500 to-blue-600' },
    { id: 'NEET', name: 'NEET', icon: '🩺', color: 'from-green-500 to-green-600' },
    { id: 'UPSC', name: 'UPSC', icon: '🏛️', color: 'from-yellow-500 to-yellow-600' },
];

const ExamGoalContext = createContext<ExamGoalContextType | undefined>(undefined);

export const ExamGoalProvider = ({ children }: { children: ReactNode }) => {
    const [availableGoals, setAvailableGoals] = useState<ExamGoal[]>(defaultExamGoals);
    const [selectedGoal, setSelectedGoal] = useState<ExamGoal>(defaultExamGoals[0]);
    const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const openGoalSelector = () => setIsGoalSelectorOpen(true);
    const closeGoalSelector = () => setIsGoalSelectorOpen(false);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const { data, error } = await supabase
                    .from('exam_goals')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    setAvailableGoals(data);
                    // Optionally set default if current selected is not in list
                    // For now, keep default logic simple
                    if (!data.find(g => g.id === selectedGoal.id)) {
                        setSelectedGoal(data[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch exam goals:', err);
                // Keep defaultExamGoals on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchGoals();
    }, []);

    return (
        <ExamGoalContext.Provider value={{
            selectedGoal,
            setSelectedGoal,
            availableGoals,
            isGoalSelectorOpen,
            openGoalSelector,
            closeGoalSelector,
            isLoading
        }}>
            {children}
        </ExamGoalContext.Provider>
    );
};

export const useExamGoal = () => {
    const context = useContext(ExamGoalContext);
    // Safe fallback when used outside ExamGoalProvider (e.g. public pages / Header)
    if (!context) {
        return {
            selectedGoal: defaultExamGoals[0],
            setSelectedGoal: () => { },
            availableGoals: defaultExamGoals,
            isGoalSelectorOpen: false,
            openGoalSelector: () => { },
            closeGoalSelector: () => { },
            isLoading: false,
        };
    }
    return context;
};
