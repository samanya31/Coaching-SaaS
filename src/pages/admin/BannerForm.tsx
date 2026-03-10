import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, Move, Calendar, FileText, Target, Type as TypeIcon, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBanner, useCreateBanner, useUpdateBanner } from '@/hooks/data/useBanners';
import { useTenant } from '@/app/providers/TenantProvider';
import r2 from '@/services/r2.service';
import type { BannerType, BannerAudience } from '@/types/banner';
import { useExamGoals } from '@/hooks/data/useExamGoals';

const bannerTypes: { value: BannerType; label: string }[] = [
    { value: 'public_website', label: 'Public Website' },
    { value: 'student_dashboard', label: 'Student Dashboard' }
];

export const BannerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const { data: existingBanner, isLoading } = useBanner(id || '');
    const createBanner = useCreateBanner();
    const updateBanner = useUpdateBanner();
    const { coaching } = useTenant();
    const { examGoals } = useExamGoals();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        imageUrl: '',
        type: 'public_website' as BannerType,
        targetAudience: 'All' as BannerAudience,
        displayOrder: '0',
        startDate: '',
        endDate: '',
        isActive: true
    });

    const dynamicTargetAudiences = [
        { value: 'All', label: 'All' },
        ...examGoals.map(goal => ({ value: goal.name, label: goal.name }))
    ];

    useEffect(() => {
        if (isEdit && existingBanner) {
            setFormData({
                imageUrl: existingBanner.image_url || '',
                type: existingBanner.type || 'public_website',
                targetAudience: existingBanner.target_audience || 'All',
                displayOrder: existingBanner.display_order?.toString() || '0',
                startDate: existingBanner.start_date ? existingBanner.start_date.split('T')[0] : '',
                endDate: existingBanner.end_date ? existingBanner.end_date.split('T')[0] : '',
                isActive: existingBanner.is_active ?? true
            });
        }
    }, [isEdit, existingBanner]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});



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

        let finalImageUrl = formData.imageUrl;

        // If user selected a local file, upload to R2 first
        if (selectedFile && coaching?.id) {
            setIsUploading(true);
            setUploadProgress(0);
            const progressInterval = setInterval(() => {
                setUploadProgress(p => Math.min(p + 10, 90));
            }, 300);

            try {
                finalImageUrl = await r2.upload(coaching.id, 'banners', selectedFile, {
                    entityType: 'banner'
                });
                setUploadProgress(100);
            } catch (error) {
                console.error('Failed to upload banner image:', error);
                alert('Image upload failed. Please try again.');
                setIsUploading(false);
                clearInterval(progressInterval);
                return; // Stop form submission if upload fails
            } finally {
                clearInterval(progressInterval);
                setIsUploading(false);
            }
        }

        const bannerData = {
            image_url: finalImageUrl,
            type: formData.type,
            target_audience: formData.targetAudience,
            display_order: parseInt(formData.displayOrder),
            start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            is_active: formData.isActive
        };

        try {
            if (isEdit && id) {
                // If we uploaded a new image, delete the old one from R2
                if (selectedFile && existingBanner?.image_url) {
                    const oldUrl = existingBanner.image_url;
                    // Only delete if it's an R2 URL and different from new URL
                    if (oldUrl !== finalImageUrl && (oldUrl.includes('r2.dev') || oldUrl.includes('exam-edge-media'))) {
                        void r2.remove(oldUrl); // Background removal
                    }
                }
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

            // Auto-set target audience to 'All' when type is 'public_website'
            if (field === 'type' && value === 'public_website') {
                updated.targetAudience = 'All';
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

                            {/* File Upload Option */}
                            <div className="mb-4">
                                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${selectedFile ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className={`w-8 h-8 mb-2 ${selectedFile ? 'text-indigo-500' : 'text-gray-400'}`} />
                                        <p className="mb-1 text-sm text-gray-500 font-semibold">
                                            {selectedFile ? selectedFile.name : 'Click to upload from computer'}
                                        </p>
                                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                // Clear string URL if they pick a file
                                                setFormData({ ...formData, imageUrl: URL.createObjectURL(file) });
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="flex items-center gap-4 my-2">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <span className="text-sm text-gray-400 font-medium">OR ENTER URL</span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            <div className="relative mt-2">
                                <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={!selectedFile ? formData.imageUrl : ''}
                                    onChange={(e) => {
                                        setSelectedFile(null); // Clear file if they type a URL
                                        handleChange('imageUrl', e.target.value);
                                    }}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${(errors.imageUrl && !selectedFile) ? 'border-red-500' : 'border-gray-200'} ${selectedFile ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                                    placeholder={selectedFile ? "Clear file selection to use URL..." : "Enter external image URL (https://...)"}
                                    disabled={!!selectedFile}
                                />
                                {selectedFile && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setFormData({ ...formData, imageUrl: '' });
                                        }}
                                        className="absolute right-3 top-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                        title="Clear uploaded file"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {(errors.imageUrl && !selectedFile) && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}


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
                                            {dynamicTargetAudiences.map(aud => (
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
                                disabled={createBanner.isPending || updateBanner.isPending || isUploading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isUploading ? `Uploading... ${uploadProgress}%` : (createBanner.isPending || updateBanner.isPending ? 'Saving...' : (isEdit ? 'Update Banner' : 'Create Banner'))}
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

                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium text-gray-900">{bannerTypes.find(t => t.value === formData.type)?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Audience:</span>
                                    <span className="font-medium text-gray-900">{dynamicTargetAudiences.find(a => a.value === formData.targetAudience)?.label || formData.targetAudience}</span>
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
