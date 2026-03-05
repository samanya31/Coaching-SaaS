import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/config/supabase';
import { useTenant } from '@/app/providers/TenantProvider';
import { toast } from 'sonner';

interface ExamGoal {
    id: string;
    name: string;
    icon: string;
}

interface GlobalExamGoal {
    id: string;
    name: string;
    icon: string;
}

export const ExamGoalsSettings = () => {
    const { coaching } = useTenant();
    const [localGoals, setLocalGoals] = useState<ExamGoal[]>([]);
    const [globalGoals, setGlobalGoals] = useState<GlobalExamGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form inputs
    const [selectedGlobalGoalId, setSelectedGlobalGoalId] = useState('');

    const fetchData = async () => {
        try {
            // Fetch local goals for this institute
            const { data: localData, error: localError } = await supabase
                .from('exam_goals')
                .select('*')
                .eq('coaching_id', coaching?.id)
                .order('created_at', { ascending: true });

            if (localError) throw localError;
            setLocalGoals(localData || []);

            // Fetch master global goals
            const { data: globalData, error: globalError } = await supabase
                .from('exam_goals')
                .select('*')
                .is('coaching_id', null)
                .order('name', { ascending: true });

            if (globalError) throw globalError;
            setGlobalGoals(globalData || []);
        } catch (error) {
            console.error('Error fetching exam goals:', error);
            toast.error('Failed to load exam goals');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (coaching?.id) {
            fetchData();
        }
    }, [coaching?.id]);

    // Filter out global goals that the institute has already added (matching by name)
    const availableGlobalGoals = globalGoals.filter(
        (globalGoal) => !localGoals.some((localGoal) => localGoal.name === globalGoal.name)
    );

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGlobalGoalId || !coaching?.id) return;

        const globalGoalToAdd = globalGoals.find(g => g.id === selectedGlobalGoalId);
        if (!globalGoalToAdd) return;

        setIsAdding(true);
        try {
            const { error } = await supabase.from('exam_goals').insert({
                name: globalGoalToAdd.name,
                icon: globalGoalToAdd.icon,
                coaching_id: coaching.id
            });

            if (error) throw error;

            toast.success(`${globalGoalToAdd.name} added to your institute!`);
            setSelectedGlobalGoalId('');
            fetchData();
        } catch (error: any) {
            console.error('Error adding exam goal:', error);
            toast.error(error.message || 'Failed to add goal');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteGoal = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from your active goals?`)) return;

        try {
            const { error } = await supabase
                .from('exam_goals')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success(`${name} removed from your institute`);
            fetchData();
        } catch (error: any) {
            console.error('Error deleting exam goal:', error);
            toast.error(error.message || 'Failed to delete goal');
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Exam Goals</h2>
                <span className="text-sm text-gray-500">Select active exam categories from the global master list for your institute.</span>
            </div>

            {/* Add New Goal Form */}
            <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Add Goal to Institute</h3>
                <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-2/3 space-y-1">
                        <label className="text-xs text-gray-500">Select Global Goal</label>
                        <select
                            value={selectedGlobalGoalId}
                            onChange={(e) => setSelectedGlobalGoalId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            required
                        >
                            <option value="" disabled>-- Select an Exam Goal --</option>
                            {availableGlobalGoals.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.icon} {g.name}
                                </option>
                            ))}
                        </select>
                        {availableGlobalGoals.length === 0 && !isLoading && (
                            <p className="text-xs text-amber-600 mt-1">
                                You have already added all available master exam goals.
                            </p>
                        )}
                    </div>

                    <Button type="submit" disabled={isAdding || !selectedGlobalGoalId} className="bg-indigo-600 hover:bg-indigo-700">
                        {isAdding ? 'Adding...' : <><Plus className="w-4 h-4 mr-1" /> Add</>}
                    </Button>
                </form>
            </div>

            {/* Goals List */}
            {
                isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading your goals...</div>
                ) : localGoals.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No exam goals active. Add your first goal above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {localGoals.map(goal => (
                            <div key={goal.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl text-indigo-600 shadow-sm`}>
                                    {goal.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                                </div>
                                <button
                                    onClick={() => handleDeleteGoal(goal.id, goal.name)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove from Institute"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
};
