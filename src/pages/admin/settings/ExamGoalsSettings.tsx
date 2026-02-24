import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/config/supabase';
import { useTenant } from '@/app/providers/TenantProvider';

interface ExamGoal {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const EMOJI_OPTIONS = [
    '📚', '⚛️', '🩺', '🏛️', '🎯', '🔬',
    '💼', '🏫', '👨‍🏫', '⚖️', '💻', '📝',
    '🎓', '📐', '🧬', '👮', '🏦', '🌏'
];

export const ExamGoalsSettings = () => {
    const { coaching } = useTenant();
    const [goals, setGoals] = useState<ExamGoal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form inputs
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('');

    const fetchGoals = async () => {
        try {
            const { data, error } = await supabase
                .from('exam_goals')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error('Error fetching exam goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newIcon || !coaching?.id) return;

        setIsAdding(true);
        try {
            const { error } = await supabase.from('exam_goals').insert({
                name: newName,
                icon: newIcon,
                coaching_id: coaching.id
            });

            if (error) throw error;

            setNewName('');
            setNewIcon('');
            fetchGoals();
        } catch (error) {
            console.error('Error adding exam goal:', error);
            alert('Failed to add goal');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            const { error } = await supabase
                .from('exam_goals')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchGoals();
        } catch (error) {
            console.error('Error deleting exam goal:', error);
            alert('Failed to delete goal');
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Exam Goals</h2>
                <span className="text-sm text-gray-500">Manage available exam categories</span>
            </div>

            {/* Add New Goal Form */}
            <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Add New Goal</h3>
                <form onSubmit={handleAddGoal} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-1/2 space-y-1">
                        <label className="text-xs text-gray-500">Goal Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. UPSC, JEE"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="w-full sm:w-1/2 space-y-1">
                        <label className="text-xs text-gray-500">Icon</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById('emoji-picker');
                                    if (el) el.classList.toggle('hidden');
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left flex items-center justify-between bg-white"
                            >
                                <span>{newIcon || 'Select Icon'}</span>
                                <span className="text-gray-400">▼</span>
                            </button>

                            <div id="emoji-picker" className="hidden absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64">
                                <div className="grid grid-cols-6 gap-2">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => {
                                                setNewIcon(emoji);
                                                document.getElementById('emoji-picker')?.classList.add('hidden');
                                            }}
                                            className={`p-2 hover:bg-gray-100 rounded text-xl ${newIcon === emoji ? 'bg-indigo-50 ring-1 ring-indigo-500' : ''}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button type="submit" disabled={isAdding} className="bg-indigo-600 hover:bg-indigo-700">
                        {isAdding ? 'Adding...' : <><Plus className="w-4 h-4 mr-1" /> Add</>}
                    </Button>
                </form>
            </div>

            {/* Goals List */}
            {
                isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No exam goals added yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {goals.map(goal => (
                            <div key={goal.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${goal.color} flex items-center justify-center text-2xl text-white shadow-sm`}>
                                    {goal.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                                </div>
                                <button
                                    onClick={() => handleDeleteGoal(goal.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
