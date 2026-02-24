import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Phone, BookOpen, Clock, Award, Globe, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useCreateUser, useUpdateUser } from '@/hooks/data/useUsers';
import { UserRole } from '@/types/user';

export const InstructorForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { data: existingUser, isLoading } = useUser(id);
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: '',
        subject: '',
        experience: 0,
        qualification: '',
        bio: '',
        status: 'active' as 'active' | 'inactive' | 'suspended' | 'blocked',
        socialLinks: {
            linkedin: '',
            twitter: ''
        }
    });

    // Populate form when editing
    useEffect(() => {
        if (existingUser) {
            setFormData({
                name: existingUser.full_name || existingUser.name || '',
                email: existingUser.email,
                phone: existingUser.phone || '',
                avatar: existingUser.avatar_url || existingUser.avatar || '',
                subject: existingUser.metadata?.subject || '',
                experience: existingUser.metadata?.experience || 0,
                qualification: existingUser.metadata?.qualification || '',
                bio: existingUser.metadata?.bio || '',
                status: (existingUser.status || 'active') as 'active' | 'inactive' | 'suspended' | 'blocked',
                socialLinks: existingUser.metadata?.socialLinks || { linkedin: '', twitter: '' }
            });
        }
    }, [existingUser]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [platform]: value }
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const userData = {
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            status: formData.status,
            avatar_url: formData.avatar,
            role: 'teacher' as UserRole,
            metadata: {
                subject: formData.subject,
                experience: formData.experience,
                qualification: formData.qualification,
                bio: formData.bio,
                socialLinks: formData.socialLinks
            }
        };

        try {
            if (isEditMode && id) {
                await updateUser.mutateAsync({ userId: id, updates: userData });
            } else {
                await createUser.mutateAsync(userData);
            }
            navigate('/admin/dashboard/instructors');
        } catch (error) {
            console.error('Failed to save instructor:', error);
            // Handle error (show toast etc.)
        }
    };

    if (isEditMode && isLoading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard/instructors')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Profile' : 'Add New Instructor'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditMode ? `Update details for ${formData.name}` : 'Onboard a new faculty member'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Avatar & Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                            <div className="w-32 h-32 rounded-full bg-gray-100 mx-auto mb-4 overflow-hidden relative group">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs cursor-pointer">
                                    Change Photo
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900">{formData.name || 'Instructor Name'}</h3>
                            <p className="text-sm text-gray-500">{formData.subject || 'Subject'}</p>

                            <div className="mt-6 pt-6 border-t border-gray-100 text-left">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" />
                                Professional Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Expertise</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => handleChange('subject', e.target.value)}
                                            placeholder="e.g. Physics"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.experience}
                                            onChange={(e) => handleChange('experience', parseInt(e.target.value))}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                    <input
                                        type="text"
                                        value={formData.qualification}
                                        onChange={(e) => handleChange('qualification', e.target.value)}
                                        placeholder="e.g. Ph.D. in Physics"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    <textarea
                                        rows={4}
                                        value={formData.bio}
                                        onChange={(e) => handleChange('bio', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Brief introduction..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                Social Profiles
                            </h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="url"
                                        value={formData.socialLinks?.linkedin}
                                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                        placeholder="LinkedIn Profile URL"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="url"
                                        value={formData.socialLinks?.twitter}
                                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                        placeholder="Twitter Profile URL"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" size="lg" className="flex items-center gap-2 w-full md:w-auto">
                                <Save className="w-5 h-5" />
                                Save Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
