import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, Users, Link as LinkIcon, Youtube, Video, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveClass, useCreateLiveClass, useUpdateLiveClass } from '@/hooks/data/useLiveClasses';
import { useBatches } from '@/hooks/data/useBatches';
import { useInstructors } from '@/hooks/data/useInstructors';
import { useTenant } from '@/app/providers/TenantProvider';
import { supabase } from '@/config/supabase';
import { extractYouTubeId } from '@/components/student/YouTubePlayer';

const statuses = ['scheduled', 'live', 'completed', 'cancelled'];

type Platform = 'zoom' | 'youtube' | 'custom';

export const LiveClassForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefilledBatchId = searchParams.get('batchId');
    const isEdit = !!id;

    const { data: existingClass, isLoading: isLoadingClass } = useLiveClass(id);
    const { data: batches = [] } = useBatches();
    const { data: instructors = [] } = useInstructors();
    const { coachingId } = useTenant();

    const { mutate: createLiveClass } = useCreateLiveClass();
    const { mutate: updateLiveClass } = useUpdateLiveClass();

    const [platform, setPlatform] = useState<Platform>('custom');
    const [isZoomConfigured, setIsZoomConfigured] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        instructor: '',
        scheduledAt: '',
        duration: '60',
        // Custom / fallback
        meetingLink: '',
        // Zoom
        zoomMeetingNumber: '',
        zoomMeetingPassword: '',
        // YouTube
        youtubeUrl: '',
        status: 'scheduled',
        batchId: prefilledBatchId || ''
    });

    // Check if Zoom is configured globally for the platform
    useEffect(() => {
        const checkZoom = async () => {
            const { data } = await supabase.from('platform_settings').select('settings').eq('id', 'global').single();
            setIsZoomConfigured(!!(data?.settings?.zoom_sdk_key && data?.settings?.zoom_sdk_secret));
        };
        checkZoom();
    }, []);

    useEffect(() => {
        if (existingClass) {
            setPlatform((existingClass.platform as Platform) || 'custom');
            setFormData({
                title: existingClass.title,
                instructor: existingClass.instructor,
                scheduledAt: new Date(existingClass.scheduled_at).toISOString().slice(0, 16),
                duration: existingClass.duration_minutes?.toString() || '60',
                meetingLink: existingClass.meeting_link || '',
                zoomMeetingNumber: existingClass.zoom_meeting_number || '',
                zoomMeetingPassword: existingClass.zoom_meeting_password || '',
                youtubeUrl: existingClass.youtube_video_id || '',
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
        if (!formData.batchId) newErrors.batchId = 'Select a batch';
        if (platform === 'zoom' && !formData.zoomMeetingNumber.trim()) newErrors.zoomMeetingNumber = 'Meeting number is required';
        if (platform === 'youtube' && !formData.youtubeUrl.trim()) newErrors.youtubeUrl = 'YouTube URL is required';
        if (platform === 'custom' && !formData.meetingLink.trim()) newErrors.meetingLink = 'Meeting link is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload: any = {
            title: formData.title,
            instructor: formData.instructor,
            scheduled_at: new Date(formData.scheduledAt).toISOString(),
            duration_minutes: parseInt(formData.duration),
            status: formData.status as any,
            batch_id: formData.batchId,
            platform,
        };

        if (platform === 'zoom') {
            payload.zoom_meeting_number = formData.zoomMeetingNumber.trim();
            payload.zoom_meeting_password = formData.zoomMeetingPassword.trim();
            payload.meeting_link = null;
            payload.youtube_video_id = null;
        } else if (platform === 'youtube') {
            payload.youtube_video_id = extractYouTubeId(formData.youtubeUrl);
            payload.meeting_link = null;
            payload.zoom_meeting_number = null;
            payload.zoom_meeting_password = null;
        } else {
            payload.meeting_link = formData.meetingLink;
            payload.youtube_video_id = null;
            payload.zoom_meeting_number = null;
            payload.zoom_meeting_password = null;
        }

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
                    navigate(formData.batchId ? `/admin/dashboard/batches/${formData.batchId}` : '/admin/dashboard/live-classes');
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading class details...</p>
                </div>
            </div>
        );
    }

    const platformOptions: { value: Platform; label: string; icon: React.ReactNode; description: string; disabled?: boolean }[] = [
        {
            value: 'zoom',
            label: 'Zoom',
            icon: <Video className="w-5 h-5" />,
            description: 'Embedded Zoom — full camera, chat & screen share',
            disabled: !isZoomConfigured,
        },
        {
            value: 'youtube',
            label: 'YouTube',
            icon: <Youtube className="w-5 h-5" />,
            description: 'YouTube live stream or unlisted video',
        },
        {
            value: 'custom',
            label: 'Custom Link',
            icon: <LinkIcon className="w-5 h-5" />,
            description: 'Google Meet, Teams, or any other link',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard/live-classes')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
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
                                    onChange={e => handleChange('title', e.target.value)}
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
                                            onChange={e => handleChange('instructor', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white ${errors.instructor ? 'border-red-500' : 'border-gray-200'}`}
                                        >
                                            <option value="">Select Instructor</option>
                                            {instructors.map(inst => (
                                                <option key={inst.id} value={inst.name}>{inst.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.instructor}
                                            onChange={e => handleChange('instructor', e.target.value)}
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
                                        onChange={e => handleChange('scheduledAt', e.target.value)}
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
                                        onChange={e => handleChange('duration', e.target.value)}
                                        min="15" step="15"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Platform Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Platform <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {platformOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        disabled={opt.disabled}
                                        onClick={() => !opt.disabled && setPlatform(opt.value)}
                                        className={`relative text-left p-4 rounded-xl border-2 transition-all ${platform === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'} ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className={`mb-2 ${platform === opt.value ? 'text-indigo-600' : 'text-gray-500'}`}>{opt.icon}</div>
                                        <p className={`font-semibold text-sm ${platform === opt.value ? 'text-indigo-700' : 'text-gray-800'}`}>{opt.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.description}</p>
                                        {opt.disabled && (
                                            <span className="absolute top-2 right-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                                Setup needed
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Platform-specific fields */}
                        {platform === 'zoom' && (
                            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
                                    <Video className="w-4 h-4" /> Zoom Meeting Details
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Number <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.zoomMeetingNumber}
                                                onChange={e => handleChange('zoomMeetingNumber', e.target.value)}
                                                className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.zoomMeetingNumber ? 'border-red-500' : 'border-gray-200'}`}
                                                placeholder="123 456 7890"
                                            />
                                        </div>
                                        {errors.zoomMeetingNumber && <p className="text-red-500 text-sm mt-1">{errors.zoomMeetingNumber}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Password</label>
                                        <input
                                            type="text"
                                            value={formData.zoomMeetingPassword}
                                            onChange={e => handleChange('zoomMeetingPassword', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                            placeholder="optional"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600">Students will join the meeting embedded inside the app — no external app needed.</p>
                            </div>
                        )}

                        {platform === 'youtube' && (
                            <div className="space-y-3 p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-sm font-medium text-red-700 flex items-center gap-2">
                                    <Youtube className="w-4 h-4" /> YouTube URL
                                </p>
                                <div>
                                    <input
                                        type="text"
                                        value={formData.youtubeUrl}
                                        onChange={e => handleChange('youtubeUrl', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white ${errors.youtubeUrl ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="https://youtube.com/live/abc123 or https://youtu.be/abc123"
                                    />
                                    {errors.youtubeUrl && <p className="text-red-500 text-sm mt-1">{errors.youtubeUrl}</p>}
                                </div>
                                {formData.youtubeUrl && (
                                    <p className="text-xs text-red-600">
                                        Video ID: <strong>{extractYouTubeId(formData.youtubeUrl)}</strong>
                                    </p>
                                )}
                                <p className="text-xs text-red-600">Works with live streams, unlisted videos, and public videos.</p>
                            </div>
                        )}

                        {platform === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        value={formData.meetingLink}
                                        onChange={e => handleChange('meetingLink', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.meetingLink ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="https://meet.google.com/..."
                                    />
                                </div>
                                {errors.meetingLink && <p className="text-red-500 text-sm mt-1">{errors.meetingLink}</p>}
                            </div>
                        )}

                        {/* Status (edit only) */}
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => handleChange('status', e.target.value)}
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
                                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.batchId === batch.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
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
                            <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard/live-classes')}>
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
