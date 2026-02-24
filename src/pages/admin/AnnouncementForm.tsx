
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Megaphone, Target, Layers, Layout, AlertTriangle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnnouncement, useCreateAnnouncement, useUpdateAnnouncement } from '@/hooks/data/useAnnouncements';
import { useBatches } from '@/hooks/data/useBatches';
import { Announcement } from '@/services/api/announcement.service';

const examGoals = ['NEET', 'JEE', 'UPSC', 'SSC', 'Banking', 'Foundation', 'School Boards'];
type AnnouncementType = Announcement['type'];
const announcementTypes: { value: AnnouncementType; label: string; icon: any; color: string }[] = [
    { value: 'info', label: 'Information', icon: Info, color: 'text-blue-500' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-500' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-500' },
    { value: 'error', label: 'Critical Alert', icon: AlertCircle, color: 'text-red-500' },
];

export const AnnouncementForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    // Hooks
    const { data: existingAnnouncement, isLoading } = useAnnouncement(id || '');
    const { data: batches = [] } = useBatches();
    const createAnnouncement = useCreateAnnouncement();
    const updateAnnouncement = useUpdateAnnouncement();

    const [formData, setFormData] = useState<Partial<Announcement> & { targetType: string; targetValue: string }>({
        title: '',
        content: '',
        type: 'info',
        targetType: 'all',
        targetValue: '',
        is_pinned: false,
    });

    useEffect(() => {
        if (isEditing && existingAnnouncement) {
            // Map DB announcement to Form
            let tType = 'all';
            let tValue = '';
            if (existingAnnouncement.target_exam_goals?.length) { tType = 'exam_goal'; tValue = existingAnnouncement.target_exam_goals[0]; }
            else if (existingAnnouncement.target_batches?.length) { tType = 'batch'; tValue = existingAnnouncement.target_batches[0]; }

            setFormData({
                ...existingAnnouncement,
                targetType: tType,
                targetValue: tValue
            });
        }
    }, [existingAnnouncement, isEditing]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Map Form to DB
        // NOTE: target_roles, target_batches, target_exam_goals require the migration:
        //   supabase/migrations/012_add_announcement_targeting_columns.sql
        const targetBatches = formData.targetType === 'batch' ? [formData.targetValue].filter(Boolean) : [];
        const targetGoals = formData.targetType === 'exam_goal' ? [formData.targetValue].filter(Boolean) : [];

        const dbData: Partial<Announcement> = {
            title: formData.title,
            content: formData.content || (formData as any).message,
            type: formData.type,
            is_pinned: formData.is_pinned,
            target_roles: [],
            target_batches: targetBatches,
            target_exam_goals: targetGoals,
        };

        try {
            if (isEditing && id) {
                await updateAnnouncement.mutateAsync({ announcementId: id, updates: dbData });
            } else {
                await createAnnouncement.mutateAsync(dbData);
            }
            navigate('/admin/dashboard/announcements');
        } catch (error: any) {
            console.error('Failed to save announcement', error);
            alert('Failed to save announcement: ' + (error?.message || 'Unknown error. Check the console for details.'));
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Announcement' : 'New Announcement'}
                    </h1>
                    <p className="text-gray-600 mt-1">Create notifications for students</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Physics Class Cancelled"
                                required
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                value={(formData as any).content || (formData as any).message || ''}
                                onChange={(e) => handleChange('content', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Enter detailed message..."
                                required
                            />
                        </div>

                        {/* Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                            <div className="space-y-2">
                                {announcementTypes.map((type) => (
                                    <div
                                        key={type.value}
                                        onClick={() => handleChange('type', type.value)}
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${formData.type === type.value
                                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <type.icon className={`w-5 h-5 mr-3 ${type.color}`} />
                                        <span className="text-sm font-medium text-gray-700">{type.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Target Selection */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                <select
                                    value={formData.targetType}
                                    onChange={(e) => handleChange('targetType', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="all">Everyone (Global)</option>
                                    <option value="exam_goal">Exam Goal Specific</option>
                                    <option value="batch">Specific Batch</option>
                                </select>
                            </div>

                            {/* Conditional Target Value */}
                            {formData.targetType === 'exam_goal' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Goal</label>
                                    <select
                                        value={formData.targetValue}
                                        onChange={(e) => handleChange('targetValue', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Exam Goal</option>
                                        {examGoals.map(goal => (
                                            <option key={goal} value={goal}>{goal}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.targetType === 'batch' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch</label>
                                    <select
                                        value={formData.targetValue}
                                        onChange={(e) => handleChange('targetValue', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map(batch => (
                                            <option key={batch.id} value={batch.id}>
                                                {batch.name || batch.title} ({batch.exam_goal || batch.examGoal})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Save className="w-4 h-4 mr-2" />
                                Save Announcement
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className={`p-4 rounded-lg border-l-4 ${formData.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                            formData.type === 'success' ? 'bg-green-50 border-green-500' :
                                formData.type === 'error' ? 'bg-red-50 border-red-500' : // Changed 'alert' to 'error'
                                    'bg-blue-50 border-blue-500'
                            }`}>
                            <div className="flex gap-3">
                                {formData.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
                                {formData.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
                                {formData.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />} {/* Changed 'alert' to 'error' */}
                                {formData.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}

                                <div>
                                    <p className={`font-semibold ${formData.type === 'warning' ? 'text-amber-800' :
                                        formData.type === 'success' ? 'text-green-800' :
                                            formData.type === 'error' ? 'text-red-800' : // Changed 'alert' to 'error'
                                                'text-blue-800'
                                        }`}>
                                        {formData.title || 'Announcement Title'}
                                    </p>
                                    <p className={`text-sm mt-1 ${formData.type === 'warning' ? 'text-amber-700' :
                                        formData.type === 'success' ? 'text-green-700' :
                                            formData.type === 'error' ? 'text-red-700' : // Changed 'alert' to 'error'
                                                'text-blue-700'
                                        }`}>
                                        {formData.content || 'This is how your announcement description will look to students.'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">Just now • {
                                        formData.targetType === 'all' ? 'Global' :
                                            formData.targetType === 'exam_goal' ? `Goal: ${formData.targetValue || 'None'}` :
                                                `Batch: ${formData.targetValue || 'None'}`
                                    }</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
                        <p className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4" />
                            Targeting Rules:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Global:</strong> Visible to all students.</li>
                            <li><strong>Exam Goal:</strong> Visible to students with matching goal (e.g., JEE).</li>
                            <li><strong>Batch:</strong> Visible ONLY to students enrolled in the specific batch.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
