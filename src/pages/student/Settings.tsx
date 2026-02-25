import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, BookOpen, Globe, Edit2, Save, X, Lock, Eye, EyeOff, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/config/supabase';
import { useTenant } from '@/app/providers/TenantProvider';
import r2 from '@/services/r2.service';

// Move InputField outside component to prevent recreation on every render
const InputField = ({
    label,
    icon: Icon,
    value,
    field,
    type = 'text',
    disabled = false,
    options,
    isEditing,
    setFormData,
    isLoadingOptions = false
}: any) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
            </label>
            {isEditing && !disabled ? (
                options ? (
                    <select
                        value={value}
                        onChange={(e) => setFormData((docs: any) => ({ ...docs, [field]: e.target.value }))}
                        disabled={isLoadingOptions}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">{isLoadingOptions ? 'Loading...' : `Select ${label}`}</option>
                        {options.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => setFormData((docs: any) => ({ ...docs, [field]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder={`Enter ${label.toLowerCase()}`}
                    />
                )
            ) : (
                <div className="text-base font-medium text-gray-900 min-h-[24px]">
                    {value || <span className="text-gray-400 italic">Not set</span>}
                </div>
            )}
        </div>
    );
};

export const StudentSettings = () => {
    const { user, updateProfile } = useAuth();
    const { coachingId } = useTenant();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Password change state
    const [pwData, setPwData] = useState({ current: '', newPw: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
    const [isSavingPw, setIsSavingPw] = useState(false);

    // Avatar upload state
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Sync avatar from user context
    useEffect(() => {
        if (user?.avatar_url) setAvatarUrl(user.avatar_url);
    }, [user?.avatar_url]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id || !coachingId) return;
        setIsUploadingAvatar(true);
        try {
            // Upload to R2: institutes/{coachingId}/avatars/{userId}/{uuid}-{filename}
            const publicUrl = await r2.upload(coachingId, 'avatars', file, { subFolder: user.id });

            // Save to users table
            const { error: dbError } = await supabase
                .from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
            if (dbError) throw dbError;

            setAvatarUrl(publicUrl);
            toast.success('Profile photo updated!');
        } catch (err: any) {
            toast.error('Upload failed: ' + err.message);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        if (pwData.newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (pwData.newPw !== pwData.confirm) { toast.error('Passwords do not match'); return; }

        setIsSavingPw(true);
        try {
            const bcrypt = await import('bcryptjs');

            // Verify current password against stored hash
            const { data: userData } = await supabase
                .from('users').select('password_hash').eq('id', user.id).single();

            if (userData?.password_hash) {
                const match = await bcrypt.compare(pwData.current, userData.password_hash);
                if (!match) { toast.error('Current password is incorrect'); return; }
            }

            // Hash and save new bcrypt password
            const newHash = await bcrypt.hash(pwData.newPw, 10);
            const { error } = await supabase
                .from('users').update({ password_hash: newHash }).eq('id', user.id);

            if (error) throw error;

            // Also update Supabase Auth password for the current logged-in user
            const { error: authError } = await supabase.auth.updateUser({ password: pwData.newPw });
            if (authError) {
                console.warn('Supabase Auth password update failed:', authError.message);
                toast.success('Password changed, but you may need to log out and log in again.');
            } else {
                toast.success('Password changed successfully.');
            }

            setPwData({ current: '', newPw: '', confirm: '' });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to change password');
        } finally {
            setIsSavingPw(false);
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        exams: '',
        language: '',
        address: '',
        personal_email: ''
    });

    const [examGoals, setExamGoals] = useState<Array<{ id: string; name: string }>>([]);
    const [isLoadingGoals, setIsLoadingGoals] = useState(true);

    // Fetch exam goals from database (admin-managed)
    useEffect(() => {
        const fetchExamGoals = async () => {
            try {
                const { data, error } = await supabase
                    .from('exam_goals')
                    .select('id, name')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setExamGoals(data || []);
            } catch (error) {
                console.error('Error fetching exam goals:', error);
                setExamGoals([
                    { id: 'JEE', name: 'JEE' },
                    { id: 'NEET', name: 'NEET' },
                    { id: 'UPSC', name: 'UPSC' }
                ]);
            } finally {
                setIsLoadingGoals(false);
            }
        };

        fetchExamGoals();
    }, []);

    // Initialize form data when user first loads (only once per user ID)
    const initializedUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (user && user.id !== initializedUserIdRef.current) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                mobile: user.phone || '',
                exams: user.exam_goal || '',
                language: user.language || '',
                address: user.address || '',
                personal_email: user.personal_email || ''
            });
            initializedUserIdRef.current = user.id;
        }
    }, [user?.id]);

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        if (formData.personal_email && !formData.personal_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Please enter a valid personal email address');
            return;
        }

        try {
            setIsLoading(true);
            await updateProfile({
                name: formData.name.trim(),
                phone: formData.mobile.trim() || undefined,
                address: formData.address.trim() || undefined,
                personal_email: formData.personal_email.trim() || undefined,
                language: formData.language || undefined,
                exam_goal: formData.exams || undefined
            });
            toast.success('Settings updated successfully');
            setIsEditing(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || 'Failed to update settings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                mobile: user.phone || '',
                exams: user.exam_goal || '',
                language: user.language || '',
                address: user.address || '',
                personal_email: user.personal_email || ''
            });
        }
        setIsEditing(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const languageOptions = ['English', 'Hinglish', 'Hindi'];
    const examOptions = examGoals.map(goal => goal.name);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
            <div className="px-4 py-6">
                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar with Upload button */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg uppercase overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    formData.name?.charAt(0) || 'U'
                                )}
                            </div>
                            {/* Upload button */}
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-colors border-2 border-white"
                                title="Upload profile photo"
                            >
                                {isUploadingAvatar ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </button>
                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>

                        {/* Name and Basic Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.name}</h1>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{formData.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm">{formData.mobile || 'No mobile'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                                        <X className="w-4 h-4 mr-2" /> Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                                        <Save className="w-4 h-4 mr-2" /> {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit Settings
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                            Personal Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Full Name" icon={User} value={formData.name} field="name" isEditing={isEditing} setFormData={setFormData} />
                            <InputField label="Mobile No" icon={Phone} value={formData.mobile} field="mobile" type="tel" isEditing={isEditing} setFormData={setFormData} />
                            <InputField label="Institute Email" icon={Mail} value={formData.email} field="email" disabled={true} isEditing={isEditing} setFormData={setFormData} />
                            <InputField label="Personal Email" icon={Mail} value={formData.personal_email} field="personal_email" type="email" isEditing={isEditing} setFormData={setFormData} />
                            <InputField label="Address" icon={MapPin} value={formData.address} field="address" isEditing={isEditing} setFormData={setFormData} />
                        </div>
                    </div>

                    {/* Academic Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                            Academic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Exam Goal"
                                icon={BookOpen}
                                value={formData.exams}
                                field="exams"
                                options={examOptions}
                                isEditing={isEditing}
                                setFormData={setFormData}
                                isLoadingOptions={isLoadingGoals}
                            />
                            <InputField label="Preferred Language" icon={Globe} value={formData.language} field="language" options={languageOptions} isEditing={isEditing} setFormData={setFormData} />
                        </div>
                    </div>
                </motion.div>

                {/* Change Password Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mt-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Change Password</h2>
                    <p className="text-sm text-gray-500 mb-6">Update your login password.</p>
                    <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {([
                            { key: 'current', label: 'Current Password' },
                            { key: 'newPw', label: 'New Password' },
                            { key: 'confirm', label: 'Confirm New Password' },
                        ] as const).map(({ key, label }) => (
                            <div key={key} className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> {label}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPw[key] ? 'text' : 'password'}
                                        value={pwData[key]}
                                        onChange={(e) => setPwData(p => ({ ...p, [key]: e.target.value }))}
                                        placeholder={label}
                                        required
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="md:col-span-3 pt-1">
                            <Button type="submit" disabled={isSavingPw} className="bg-indigo-600 hover:bg-indigo-700">
                                <Save className="w-4 h-4 mr-2" />
                                {isSavingPw ? 'Saving...' : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </motion.div>

            </div>
        </div>
    );
};
