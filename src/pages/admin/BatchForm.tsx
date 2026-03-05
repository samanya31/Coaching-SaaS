import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen, User, DollarSign, Calendar, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBatch, useCreateBatch, useUpdateBatch } from '@/hooks/data/useBatches';
import { useInstructors } from '@/hooks/data/useInstructors';
import { useExamGoals } from '@/hooks/data/useExamGoals';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const BatchForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    // Hooks
    const { data: existingBatch, isLoading } = useBatch(id || '');
    const { data: instructors = [] } = useInstructors();
    const { examGoals, isLoading: isLoadingGoals } = useExamGoals();
    const createBatch = useCreateBatch();
    const updateBatch = useUpdateBatch();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructorId: '', // Changed from instructor name to ID
        examGoal: '', // Added examGoal
        price: '',
        startDate: '',
        endDate: '',
        thumbnail: '' // Added thumbnail
    });

    useEffect(() => {
        if (isEdit && existingBatch) {
            setFormData({
                title: existingBatch.name,
                description: existingBatch.description || '',
                instructorId: existingBatch.instructor_id || (existingBatch.metadata as any)?.instructorId || '', // Use instructor_id if available
                examGoal: existingBatch.exam_goal || existingBatch.examGoal || '', // Handle varied casing if needed
                price: existingBatch.fee_amount?.toString() || '',
                startDate: existingBatch.start_date.split('T')[0],
                endDate: existingBatch.end_date?.split('T')[0] || '',
                thumbnail: existingBatch.thumbnail_url || existingBatch.thumbnail || ''
            });
        }
    }, [isEdit, existingBatch]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.examGoal.trim()) {
            newErrors.examGoal = 'Exam Goal is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.instructorId) {
            newErrors.instructor = 'Instructor is required';
        }

        if (!formData.price || parseFloat(formData.price) < 0) {
            newErrors.price = 'Valid price is required';
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'End date is required';
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

        const selectedInstructor = instructors.find(i => i.id === formData.instructorId);

        const batchData = {
            name: formData.title,
            description: formData.description,
            exam_goal: formData.examGoal, // Use form data
            fee_amount: parseFloat(formData.price),
            fee_currency: 'INR',
            start_date: new Date(formData.startDate).toISOString(),
            end_date: new Date(formData.endDate).toISOString(),
            thumbnail_url: formData.thumbnail, // Save thumbnail URL
            instructor_id: formData.instructorId, // New field
            tags: [],
            metadata: {
                instructor: selectedInstructor?.name || 'Unknown', // Fallback name
                instructorId: formData.instructorId,
                instructorAvatar: selectedInstructor?.avatar || '👨‍🏫',
                duration: 'N/A',
                totalClasses: 0
            },
            status: 'active' as const
        };

        try {
            if (isEdit && id) {
                await updateBatch.mutateAsync({ batchId: id, updates: batchData });
                alert('Batch updated successfully!');
            } else {
                await createBatch.mutateAsync(batchData);
                alert('Batch created successfully!');
            }
            navigate('/admin/dashboard/batches');
        } catch (error) {
            console.error('Failed to save batch', error);
            alert('Failed to save batch');
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
                <button onClick={() => navigate('/admin/dashboard/batches')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit Batch' : 'Create New Batch'}</h1>
                    <p className="text-gray-600 mt-1">{isEdit ? 'Update batch information' : 'Add a new course batch'}</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-3xl">
                <div className="space-y-6">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Batch Title <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="e.g., JEE Main & Advanced 2025"
                            />
                        </div>
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thumbnail URL
                        </label>
                        <div className="relative">
                            <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.thumbnail}
                                onChange={(e) => handleChange('thumbnail', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    {/* Exam Goal - Dynamic Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exam Goal <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={formData.examGoal}
                                onChange={(e) => handleChange('examGoal', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${errors.examGoal ? 'border-red-500' : 'border-gray-200'}`}
                                disabled={isLoadingGoals}
                            >
                                <option value="">Select Exam Goal</option>
                                {examGoals.map(goal => (
                                    <option key={goal.id} value={goal.name}>{goal.icon} {goal.name}</option>
                                ))}
                            </select>
                        </div>
                        {errors.examGoal && <p className="text-red-500 text-sm mt-1">{errors.examGoal}</p>}
                    </div>

                    {/* Instructor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instructor <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.instructorId}
                            onValueChange={(value) => handleChange('instructorId', value)}
                        >
                            <SelectTrigger className={errors.instructor ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select an instructor" />
                            </SelectTrigger>
                            <SelectContent>
                                {instructors.map((instructor) => (
                                    <SelectItem key={instructor.id} value={instructor.id}>
                                        <div className="flex items-center gap-2">
                                            {instructor.avatar && (
                                                <img src={instructor.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                            )}
                                            {instructor.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.instructor && <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => handleChange('price', e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.price ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="12999"
                                min="0"
                            />
                        </div>
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>

                    {/* Start & End Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.startDate ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleChange('endDate', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.endDate ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : 'border-gray-200'
                                }`}
                            placeholder="Brief description of the batch..."
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/dashboard/batches')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Save className="w-4 h-4 mr-2" />
                        {isEdit ? 'Update Batch' : 'Create Batch'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
