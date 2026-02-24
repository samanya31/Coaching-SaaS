import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, Video, Users, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveClass, useCreateLiveClass, useUpdateLiveClass } from '@/hooks/data/useLiveClasses';
import { useBatches } from '@/hooks/data/useBatches';
import { useInstructors } from '@/hooks/data/useInstructors';

const statuses = ['scheduled', 'live', 'completed', 'cancelled'];

export const LiveClassForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefilledBatchId = searchParams.get('batchId');
    const isEdit = !!id;

    const { data: existingClass, isLoading: isLoadingClass } = useLiveClass(id);
    const { data: batches = [] } = useBatches();
    const { data: instructors = [] } = useInstructors();

    const { mutate: createLiveClass } = useCreateLiveClass();
    const { mutate: updateLiveClass } = useUpdateLiveClass();

    const [formData, setFormData] = useState({
        title: '',
        instructor: '',
        scheduledAt: '',
        duration: '60',
        meetingLink: '',
        status: 'scheduled',
        batchId: prefilledBatchId || ''
    });

    useEffect(() => {
        if (existingClass) {
            setFormData({
                title: existingClass.title,
                instructor: existingClass.instructor,
                scheduledAt: new Date(existingClass.scheduled_at).toISOString().slice(0, 16),
                duration: existingClass.duration_minutes?.toString() || '60',
                meetingLink: existingClass.meeting_link || '',
                status: existingClass.status,
                batchId: existingClass.batch_id || ''
            });
        }
    }, [existingClass]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.instructor.trim()) newErrors.instructor = 'Instructor is required';
        if (!formData.scheduledAt) newErrors.scheduledAt = 'Start time is required';
        if (!formData.meetingLink.trim()) newErrors.meetingLink = 'Meeting URL is required';
        if (!formData.batchId) newErrors.batchId = 'Select a batch';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const scheduledAt = new Date(formData.scheduledAt);

        const payload: any = {
            title: formData.title,
            instructor: formData.instructor,
            scheduled_at: scheduledAt.toISOString(),
            duration_minutes: parseInt(formData.duration),
            meeting_link: formData.meetingLink,
            status: formData.status as any,
            batch_id: formData.batchId
        };

        if (isEdit) {
            updateLiveClass({ classId: id!, updates: payload }, {
                onSuccess: () => {
                    alert('Class updated successfully!');
                    navigate('/admin/dashboard/live-classes');
                }
            });
        } else {
            createLiveClass(payload, {
                onSuccess: () => {
                    alert('Class scheduled successfully!');
                    if (formData.batchId) {
                        navigate(`/admin/dashboard/batches/${formData.batchId}`);
                    } else {
                        navigate('/admin/dashboard/live-classes');
                    }
                }
            });
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    if (isEdit && isLoadingClass) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading class details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit Live Class' : 'Schedule New Class'}</h1>
                    <p className="text-gray-600 mt-1">{isEdit ? 'Update class details and timing' : 'Set up a new live session for your students'}</p>
                </div>
            </div>

            <div className="max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="space-y-6">
                        {/* Title & Instructor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                                    placeholder="e.g. Thermodynamics Doubt Session"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    {instructors.length > 0 ? (
                                        <select
                                            value={formData.instructor}
                                            onChange={(e) => handleChange('instructor', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white ${errors.instructor ? 'border-red-500' : 'border-gray-200'}`}
                                        >
                                            <option value="">Select Instructor</option>
                                            {instructors.map((inst) => (
                                                <option key={inst.id} value={inst.name}>
                                                    {inst.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.instructor}
                                            onChange={(e) => handleChange('instructor', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.instructor ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="e.g. Dr. H.C. Verma"
                                        />
                                    )}
                                </div>
                                {errors.instructor && <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>}
                            </div>
                        </div>

                        {/* Timing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduledAt}
                                        onChange={(e) => handleChange('scheduledAt', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.scheduledAt ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                </div>
                                {errors.scheduledAt && <p className="text-red-500 text-sm mt-1">{errors.scheduledAt}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (mins) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => handleChange('duration', e.target.value)}
                                        min="15"
                                        step="15"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Meeting URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="url"
                                    value={formData.meetingLink}
                                    onChange={(e) => handleChange('meetingLink', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.meetingLink ? 'border-red-500' : 'border-gray-200'}`}
                                    placeholder="https://meet.google.com/..."
                                />
                            </div>
                            {errors.meetingLink && <p className="text-red-500 text-sm mt-1">{errors.meetingLink}</p>}
                        </div>

                        {/* Status */}
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    {statuses.map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Batches */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Assign to Batch <span className="text-red-500">*</span></label>
                            <div className={`border rounded-xl p-4 max-h-60 overflow-y-auto ${errors.batchId ? 'border-red-500' : 'border-gray-200'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {batches.map(batch => (
                                        <label
                                            key={batch.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.batchId === batch.id
                                                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                                                : 'bg-white border-gray-100 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="batchId"
                                                checked={formData.batchId === batch.id}
                                                onChange={() => handleChange('batchId', batch.id)}
                                                className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{batch.name}</p>
                                                <p className="text-xs text-gray-500">{batch.exam_goal || batch.examGoal}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {errors.batchId && <p className="text-red-500 text-sm mt-1">{errors.batchId}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/dashboard/live-classes')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                                <Save className="w-4 h-4 mr-2" />
                                {isEdit ? 'Update Class' : 'Schedule Class'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
