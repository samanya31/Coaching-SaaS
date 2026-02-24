import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, Move, Calendar, FileText, Target, Type as TypeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBanner, useCreateBanner, useUpdateBanner } from '@/hooks/data/useBanners';
import type { BannerType, BannerAudience } from '@/types/banner';

const bannerTypes: { value: BannerType; label: string }[] = [
    { value: 'public_website', label: 'Public Website' },
    { value: 'student_dashboard', label: 'Student Dashboard' }
];

const targetAudiences: { value: BannerAudience; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'jee', label: 'JEE' },
    { value: 'neet', label: 'NEET' },
    { value: 'upsc', label: 'UPSC' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'ssc', label: 'SSC' },
    { value: 'banking', label: 'Banking' }
];

export const BannerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: existingBanner, isLoading } = useBanner(id || '');
    const createBanner = useCreateBanner();
    const updateBanner = useUpdateBanner();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        ctaText: 'Learn More',
        ctaLink: '/',
        type: 'public_website' as BannerType,
        targetAudience: 'all' as BannerAudience,
        displayOrder: '0',
        startDate: '',
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        if (isEdit && existingBanner) {
            setFormData({
                title: existingBanner.title || '',
                description: existingBanner.description || '',
                imageUrl: existingBanner.image_url || '',
                ctaText: existingBanner.cta_text || 'Learn More',
                ctaLink: existingBanner.cta_link || '/',
                type: existingBanner.type || 'public_website',
                targetAudience: existingBanner.target_audience || 'all',
                displayOrder: existingBanner.display_order?.toString() || '0',
                startDate: existingBanner.start_date ? existingBanner.start_date.split('T')[0] : '',
                endDate: existingBanner.end_date ? existingBanner.end_date.split('T')[0] : '',
                isActive: existingBanner.is_active ?? true
            });
        }
    }, [isEdit, existingBanner]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Demo images
    const demoImages = [
        'https://images.unsplash.com/photo-1620912189865-1e8a33f4c087?auto=format&fit=crop&q=80&w=2069',
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=2080',
        'https://images.unsplash.com/photo-1589330694653-4a8b643beeae?auto=format&fit=crop&q=80&w=2070',
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=2071'
    ];

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.imageUrl.trim()) {
            newErrors.imageUrl = 'Image URL is required';
        }

        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const bannerData = {
            title: formData.title || null,
            description: formData.description || null,
            image_url: formData.imageUrl,
            cta_text: formData.ctaText || null,
            cta_link: formData.ctaLink || null,
            type: formData.type,
            target_audience: formData.targetAudience,
            display_order: parseInt(formData.displayOrder),
            start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            is_active: formData.isActive
        };

        try {
            if (isEdit && id) {
                await updateBanner.mutateAsync({ bannerId: id, updates: bannerData });
                alert('Banner updated successfully!');
            } else {
                await createBanner.mutateAsync(bannerData);
                alert('Banner created successfully!');
            }
            navigate('/admin/dashboard/website');
        } catch (error) {
            console.error('Failed to save banner:', error);
            alert('Failed to save banner. Please try again.');
        }
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-set target audience to 'all' when type is 'public_website'
            if (field === 'type' && value === 'public_website') {
                updated.targetAudience = 'all';
            }

            return updated;
        });

        if (typeof value === 'string' && errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (isEdit && isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading banner...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard/website')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit Banner' : 'Add New Banner'}</h1>
                    <p className="text-gray-600 mt-1">{isEdit ? 'Update banner details' : 'Create a new promotional banner'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Selection */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Banner Image <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.imageUrl ? 'border-red-500' : 'border-gray-200'}`}
                                    placeholder="Enter image URL"
                                />
                            </div>
                            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}

                            {/* Quick Select */}
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-2">Quick select:</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {demoImages.map((img, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleChange('imageUrl', img)}
                                            className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${formData.imageUrl === img ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-indigo-300'}`}
                                        >
                                            <img src={img} alt={`Demo ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content Fields */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <div className="relative">
                                    <TypeIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter banner title"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        placeholder="Enter banner description"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* CTA Text & Link */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                                    <input
                                        type="text"
                                        value={formData.ctaText}
                                        onChange={(e) => handleChange('ctaText', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Learn More"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={formData.ctaLink}
                                            onChange={(e) => handleChange('ctaLink', e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="/"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>

                            {/* Type & Target Audience */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Carousel Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        {bannerTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                    <div className="relative">
                                        <Target className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <select
                                            value={formData.targetAudience}
                                            onChange={(e) => handleChange('targetAudience', e.target.value)}
                                            disabled={formData.type === 'public_website'}
                                            className={`w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${formData.type === 'public_website' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {targetAudiences.map(aud => (
                                                <option key={aud.value} value={aud.value}>{aud.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.type === 'public_website' && (
                                        <p className="text-xs text-gray-500 mt-1">Public website banners are shown to all audiences</p>
                                    )}
                                </div>
                            </div>

                            {/* Display Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                                <div className="relative">
                                    <Move className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => handleChange('displayOrder', e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        min="0"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                            </div>

                            {/* Start & End Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date (Optional)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleChange('startDate', e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleChange('endDate', e.target.value)}
                                            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.endDate ? 'border-red-500' : 'border-gray-200'}`}
                                        />
                                    </div>
                                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                                </div>
                            </div>

                            {/* Active Checkbox */}
                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Active (Visible in App)
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/dashboard/website')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                disabled={createBanner.isPending || updateBanner.isPending}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {createBanner.isPending || updateBanner.isPending ? 'Saving...' : (isEdit ? 'Update Banner' : 'Create Banner')}
                            </Button>
                        </div>
                    </div>

                    {/* Live Preview - 1 column */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
                            <div className="relative rounded-xl overflow-hidden shadow-lg mb-4">
                                {formData.imageUrl ? (
                                    <img
                                        src={formData.imageUrl}
                                        alt="Banner preview"
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                                {(formData.title || formData.description || formData.ctaText) && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                                        {formData.title && <p className="text-white font-bold text-lg mb-1">{formData.title}</p>}
                                        {formData.description && <p className="text-white/90 text-sm mb-2 line-clamp-2">{formData.description}</p>}
                                        {formData.ctaText && (
                                            <button className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                                {formData.ctaText}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium text-gray-900">{bannerTypes.find(t => t.value === formData.type)?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Audience:</span>
                                    <span className="font-medium text-gray-900">{targetAudiences.find(a => a.value === formData.targetAudience)?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Display Order:</span>
                                    <span className="font-medium text-gray-900">{formData.displayOrder}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
