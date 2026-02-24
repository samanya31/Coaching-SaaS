import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Phone, Mail, Globe, Image as ImageIcon, Lock, Wand2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useCreateUser, useUpdateUser } from '@/hooks/data/useUsers';
import { UserRole } from '@/types/user';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';
import { useTenant } from '@/app/providers/TenantProvider';
import r2 from '@/services/r2.service';

const examGoals = ['JEE', 'NEET', 'UPSC', 'Government', 'Banking', 'Engineering', 'College'];
const languages = ['Hinglish', 'English', 'Hindi'];

export const StudentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { coachingId } = useTenant();

    // Fetch existing student data if in edit mode
    const { data: existingStudent, isLoading } = useUser(id);
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();

    // Avatar state
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const uploadAvatarForUser = async (userId: string): Promise<string | null> => {
        if (!avatarFile || !coachingId) return null;
        setIsUploadingAvatar(true);
        try {
            // Upload to R2: institutes/{coachingId}/avatars/{userId}/{uuid}-{filename}
            return await r2.upload(coachingId, 'avatars', avatarFile, { subFolder: userId });
        } catch (err: any) {
            toast.error('Photo upload failed: ' + err.message);
            return null;
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        examGoal: 'JEE',
        language: 'Hinglish',
        status: 'active'
    });

    // Populate form data when existingStudent is loaded
    useEffect(() => {
        if (existingStudent) {
            setFormData({
                name: existingStudent.full_name || '',
                phone: existingStudent.phone || '',
                email: existingStudent.email || '',
                password: '', // Don't show existing hash
                examGoal: existingStudent.exam_goal || 'JEE',
                language: existingStudent.language || 'Hinglish',
                status: existingStudent.status || 'active'
            });
            // Pre-fill existing avatar
            if (existingStudent.avatar_url) {
                setAvatarPreview(existingStudent.avatar_url);
            }
        }
    }, [existingStudent]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number format';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!isEdit && !formData.password && !formData.email) {
            // If new user, encourage setting credentials
            // But strict requirement might block quick adds. Let's make it optional but recommended.
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateCredentials = () => {
        if (!formData.name) {
            alert('Please enter a Name first.');
            return;
        }

        // Logic: firstname.last4phone@examedge.com
        // Clean name: remove spaces, special chars, lowercase
        const cleanName = formData.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const phoneSuffix = formData.phone.slice(-4) || '1234';

        const autoEmail = `${cleanName}.${phoneSuffix}@examedge.com`;
        const autoPass = `Welcome@${phoneSuffix}`;

        setFormData(prev => ({
            ...prev,
            email: prev.email || autoEmail,
            password: autoPass
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const studentData: any = {
            full_name: formData.name,
            phone: formData.phone,
            email: formData.email || null,
            exam_goal: formData.examGoal,
            language: formData.language as 'Hinglish' | 'English' | 'Hindi',
            status: formData.status as 'active' | 'inactive' | 'blocked',
            role: 'student' as UserRole
        };

        try {
            // Hash password if provided
            if (formData.password) {
                const bcrypt = await import('bcryptjs');
                const hashedPassword = await bcrypt.hash(formData.password, 10);
                studentData.password_hash = hashedPassword;
            }

            if (isEdit) {
                await updateUserMutation.mutateAsync({
                    userId: id,
                    updates: studentData
                });
                // Also upload avatar if changed
                if (avatarFile) {
                    const avatarUrl = await uploadAvatarForUser(id!);
                    if (avatarUrl) {
                        await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', id!);
                    }
                }
                toast.success('Student updated successfully!');
                alert('Student updated successfully!\n\nNote: The student\'s security session will be automatically synchronized when they next log in.');
            } else {
                const created = await createUserMutation.mutateAsync(studentData);
                // Upload avatar for new student after creation
                if (avatarFile && created?.id) {
                    const avatarUrl = await uploadAvatarForUser(created.id);
                    if (avatarUrl) {
                        await supabase.from('users').update({ avatar_url: avatarUrl }).eq('id', created.id);
                    }
                }
                alert(`Student created successfully!\n\nEmail: ${formData.email}\nPassword: ${formData.password || '(No password set)'}\n\nNote: A security account will be created automatically when the student first logs in.`);
            }
            navigate('/admin/dashboard/students');
        } catch (error: any) {
            console.error('Error saving student:', error);

            if (error?.message?.includes('409') || error?.code === '23505') {
                setErrors(prev => ({
                    ...prev,
                    email: 'A student with this email already exists.'
                }));
                alert('Duplicate entry: Email or Phone already exists.');
            } else {
                alert('Failed to save student. Please try again.');
            }
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard/students')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit Student' : 'Add New Student'}</h1>
                    <p className="text-gray-600 mt-1">{isEdit ? 'Update student information' : 'Create a new student account'}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="space-y-6">
                    {/* Profile Photo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white text-2xl font-bold">
                                            {formData.name.charAt(0) || 'S'}
                                        </span>
                                    )}
                                </div>
                                {/* Quick camera overlay */}
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center border-2 border-white"
                                    title="Change photo"
                                >
                                    <Camera className="w-3 h-3" />
                                </button>
                            </div>
                            <div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={isUploadingAvatar}
                                >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    {avatarFile ? avatarFile.name.slice(0, 20) + '...' : 'Upload Photo'}
                                </Button>
                                {avatarFile && (
                                    <p className="text-xs text-indigo-600 mt-1">✓ Photo ready to upload</p>
                                )}
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarFileChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="Enter full name"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email (Login ID)
                                </label>
                                <button
                                    type="button"
                                    onClick={generateCredentials}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                >
                                    <Wand2 className="w-3 h-3" /> Auto-Generate
                                </button>
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="student@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password {isEdit ? '(Optional)' : ''}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    placeholder={isEdit ? "Set new password" : "Enter password"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Exam Goal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exam Goal <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.examGoal}
                            onChange={(e) => handleChange('examGoal', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                        >
                            {examGoals.map(goal => (
                                <option key={goal} value={goal}>{goal}</option>
                            ))}
                        </select>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Language <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={formData.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                            >
                                {languages.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Status
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={formData.status === 'active'}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-4 h-4 text-indigo-600"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="blocked"
                                    checked={formData.status === 'blocked'}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-4 h-4 text-red-600"
                                />
                                <span className="text-sm text-gray-700">Blocked</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/dashboard/students')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Save className="w-4 h-4 mr-2" />
                        {isEdit ? 'Update Student' : 'Create Student'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
