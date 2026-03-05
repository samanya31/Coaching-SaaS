import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';

interface GlobalExamGoal {
    id: string;
    name: string;
    icon: string;
}

const EMOJI_OPTIONS = [
    '📚', '⚛️', '🩺', '🏛️', '🎯', '🔬',
    '💼', '🏫', '👨‍🏫', '⚖️', '💻', '📝',
    '🎓', '📐', '🧬', '👮', '🏦', '🌏',
    '⚔️', '🚪', '⚙️', '📈', '🚀', '💡'
];



export const GlobalExamGoals = () => {
    const [goals, setGoals] = useState<GlobalExamGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form inputs
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('📚');

    const fetchGoals = async () => {
        try {
            const { data, error } = await supabase
                .from('exam_goals')
                .select('*')
                .is('coaching_id', null)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error('Error fetching global exam goals:', error);
            toast.error('Failed to load global exam goals');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newIcon) return;

        setIsAdding(true);
        try {
            const { error } = await supabase.from('exam_goals').insert({
                name: newName,
                icon: newIcon,
                coaching_id: null
            });

            if (error) throw error;

            toast.success('Global exam goal added successfully');
            setNewName('');
            setNewIcon('📚');
            fetchGoals();
        } catch (error: any) {
            console.error('Error adding global exam goal:', error);
            toast.error(error.message || 'Failed to add global goal');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteGoal = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name} from the global list? Institutes will no longer be able to select it, although their existing local copies will remain.`)) return;

        try {
            const { error } = await supabase
                .from('exam_goals')
                .delete()
                .eq('id', id)
                .is('coaching_id', null);

            if (error) throw error;

            toast.success('Global goal deleted');
            fetchGoals();
        } catch (error: any) {
            console.error('Error deleting global goal:', error);
            toast.error(error.message || 'Failed to delete global goal');
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Global Exam Goals</h2>
                <span className="text-sm text-gray-500">Manage the master list of exam goals available to coaching institutes.</span>
            </div>

            {/* Add New Global Goal Form */}
            <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Add Master Goal</h3>
                <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-6 space-y-1">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Goal Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. UPSC, JEE, IELTS"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                            required
                        />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Icon</label>
                        <div className="relative group">
                            <button
                                type="button"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left flex items-center justify-between bg-white shadow-sm"
                            >
                                <span className="text-xl leading-none">{newIcon}</span>
                                <span className="text-gray-400 text-xs text-center border-l border-gray-200 pl-2">Change</span>
                            </button>

                            <div className="hidden group-hover:block hover:block absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-xl z-10 w-64 min-w-max">
                                <div className="grid grid-cols-6 gap-2">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setNewIcon(emoji)}
                                            className={`p-2 hover:bg-gray-100 rounded-lg text-xl transition-all ${newIcon === emoji ? 'bg-indigo-50 ring-2 ring-indigo-500 scale-110 z-10' : ''}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <Button type="submit" disabled={isAdding} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium shadow-sm">
                            {isAdding ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add Goal</>}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Global Goals List */}
            {
                isLoading ? (
                    <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p>Loading global goals...</p>
                    </div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Master Goals</h3>
                        <p className="text-gray-500">Add the first global exam goal above.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {goals.map(goal => (
                            <div key={goal.id} className="group relative flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                                <div className={`w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl text-indigo-600 shadow-sm flex-shrink-0`}>
                                    {goal.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 truncate">{goal.name}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Global Template</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteGoal(goal.id, goal.name)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-white hover:bg-red-500 rounded-lg transition-all absolute right-4"
                                    title="Delete master goal"
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
