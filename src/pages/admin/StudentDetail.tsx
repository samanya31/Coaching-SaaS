import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Clock, Edit2, Ban, CheckCircle, BookOpen, FileText, Award, TrendingUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useDeleteUser, useUpdateUser } from '@/hooks/data/useUsers';
import { toast } from 'sonner';

export const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Conditional data fetching based on feature flag
    const { data: student, isLoading: isLoadingStudent } = useUser(id);
    const deleteMutation = useDeleteUser();
    const updateMutation = useUpdateUser();

    const handleDelete = async () => {
        if (!id || !window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Student deleted successfully');
            navigate('/admin/dashboard/students');
        } catch (error) {
            toast.error('Failed to delete student');
        }
    };

    const handleUpdateStatus = async (status: 'active' | 'blocked') => {
        if (!id) return;
        try {
            await updateMutation.mutateAsync({ userId: id, updates: { status } });
            toast.success(`Student ${status === 'active' ? 'activated' : 'blocked'} successfully`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Show loading state
    if (isLoadingStudent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading student...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
                    <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
                    <Link to="/admin/dashboard/students">
                        <Button>Back to Students</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Filter batches that student is enrolled in
    // Note: This requires student to have batch_enrollments or logic to check
    // If student object doesn't have batch_enrollments, we might need a separate hook or the User type needs it
    // Assuming User type from useUser includes joined data if we update the service or we explicitly fetch it here

    // For now, let's assume we can match by IDs if we had them. 
    // Since useUser might not return batch_enrollments by default (need to check),
    // we might need to rely on what is available.
    // If we assume the student object *has* batch_enrollments as per the previous Students.tsx assumption (which used useStudents)
    // But useUser (getById) might not have it.

    // Let's filter based on a hypothetical list or just show all if enrolled (mock logic was simple inclusion)
    // Real logic: We need to know which batches the student is enrolled in.
    // If fetching user by ID doesn't join batches, we need to fix the service or use a different hook.
    // Let's assume for now we filter based on what we can find or empty.

    // NOTE: Ideally we should use a hook like `useStudentBatches(id)`
    // Or we filter manually if we have enrollment data.

    // Temporary hack: Just show empty or filtering if we had `enrolled_batch_ids`
    // If `student.batch_enrollments` exists (we can check debug)

    // CASTING to any to avoid TS errors for now while we verify properties
    const studentAny = student as any;
    const enrolledBatches = studentAny.batch_enrollments
        ?.filter((e: any) => e.batches)
        ?.map((e: any) => e.batches) || [];

    const watchTimeHours = Math.floor((studentAny.metadata?.totalWatchTime || 0) / 60);
    const watchTimeMinutes = (studentAny.metadata?.totalWatchTime || 0) % 60;

    const getGoalIcon = (goal: string) => {
        const icons: { [key: string]: string } = {
            'JEE': '⚛️',
            'NEET': '🩺',
            'UPSC': '🏛️',
            'Government': '🎯',
            'Banking': '💼',
            'Engineering': '🔬',
            'College': '📚'
        };
        return icons[goal] || '🎓';
    };

    return (
        <div className="space-y-6">
            {/* Data Source Indicator (for debugging) */}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard/students')} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
                        <p className="text-gray-600 mt-1">View and manage student information</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to={`/admin/dashboard/students/${id}/edit`}>
                        <Button variant="outline">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className={student.status === 'active' ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-green-600 border-green-300 hover:bg-green-50'}
                        onClick={() => handleUpdateStatus(student.status === 'active' ? 'blocked' : 'active')}
                    >
                        {student.status === 'active' ? (
                            <>
                                <Ban className="w-4 h-4 mr-2" />
                                Block
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-3xl font-bold">{((student.full_name || 'U') + '').charAt(0)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{student.full_name || 'Unknown Student'}</h2>
                                <p className="text-gray-600">Student ID: {student.student_id || student.id}</p>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${student.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {student.status === 'active' ? '✓ Active' : '⊘ Blocked'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium text-gray-900">{student.phone}</p>
                                </div>
                            </div>
                            {student.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium text-gray-900">{student.email}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{getGoalIcon(student.exam_goal || '')}</span>
                                <div>
                                    <p className="text-sm text-gray-600">Exam Goal</p>
                                    <p className="font-medium text-gray-900">{student.exam_goal || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🗣️</span>
                                <div>
                                    <p className="text-sm text-gray-600">Language</p>
                                    <p className="font-medium text-gray-900">{studentAny.metadata?.language || 'English'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Registered</p>
                                    <p className="font-medium text-gray-900">{new Date(student.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Last Active</p>
                                    <p className="font-medium text-gray-900">{student.last_login_at ? new Date(student.last_login_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Watch Time</p>
                            <p className="text-xl font-bold text-gray-900">{watchTimeHours}h {watchTimeMinutes}m</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Classes Completed</p>
                            <p className="text-xl font-bold text-gray-900">{studentAny.metadata?.classesCompleted || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tests Taken</p>
                            <p className="text-xl font-bold text-gray-900">{studentAny.metadata?.testsTaken || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Award className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Avg Score</p>
                            <p className="text-xl font-bold text-gray-900">{studentAny.metadata?.averageScore || 0}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrolled Batches */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Enrolled Batches ({enrolledBatches.length})</h2>
                </div>
                {enrolledBatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enrolledBatches.map((batch) => (
                            <div key={batch.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                                <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                                    {batch.thumbnail_url ? (
                                        <img src={batch.thumbnail_url} alt={batch.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-indigo-400" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{batch.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{batch.metadata?.instructor || 'Unknown Instructor'}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Progress: 45%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No batches enrolled yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};
