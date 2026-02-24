import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Clock, Plus, Trash2, Edit2, Check, X, Upload, Download, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTest, useCreateTest, useUpdateTest, type TestType, type TestStatus, type TestDifficulty } from '@/hooks/data/useTests';
import { useTestQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion, useCreateQuestions } from '@/hooks/data/useTestQuestions';
import { useBatches } from '@/hooks/data/useBatches';
import { normalizeBatch } from '@/types/batch';
import type { CreateQuestionInput } from '@/types/test';
import Papa from 'papaparse';

export const TestForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: existingTest, isLoading } = useTest(id);
    const { data: questions = [] } = useTestQuestions(id);
    const createTest = useCreateTest();
    const updateTest = useUpdateTest();
    const createQuestion = useCreateQuestion();
    const createQuestions = useCreateQuestions();
    const deleteQuestion = useDeleteQuestion();
    const updateQuestion = useUpdateQuestion();

    const { data: rawBatches = [] } = useBatches();
    const allBatches = rawBatches.map(normalizeBatch);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'mock' as TestType,
        exam_goal: '',
        subject: '',
        duration: 60,
        total_marks: 100,
        passing_marks: 40,
        total_questions: 0,
        difficulty: 'medium' as TestDifficulty,
        status: 'draft' as TestStatus,
        scheduled_date: '',
        batch_id: '' as string,
    });
    const [isBatchSpecific, setIsBatchSpecific] = useState(false);

    const [currentTab, setCurrentTab] = useState<'details' | 'questions'>('details');
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
    const [questionForm, setQuestionForm] = useState({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A' as 'A' | 'B' | 'C' | 'D',
        marks: 1,
        explanation: ''
    });

    useEffect(() => {
        if (existingTest) {
            setFormData({
                title: existingTest.title,
                description: existingTest.description || '',
                type: existingTest.type,
                exam_goal: existingTest.exam_goal,
                subject: existingTest.subject,
                duration: existingTest.duration,
                total_marks: existingTest.total_marks,
                passing_marks: existingTest.passing_marks,
                total_questions: existingTest.total_questions,
                difficulty: existingTest.difficulty,
                status: existingTest.status,
                scheduled_date: existingTest.scheduled_date || '',
                batch_id: existingTest.batch_id || '',
            });
            setIsBatchSpecific(!!existingTest.batch_id);
        }
    }, [existingTest]);

    useEffect(() => {
        if (questions.length > 0) {
            const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
            setFormData(prev => ({
                ...prev,
                total_questions: questions.length,
                total_marks: totalMarks
            }));
        }
    }, [questions]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !id) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const parsedQuestions: any[] = results.data;
                const formattedQuestions: CreateQuestionInput[] = [];
                let hasError = false;

                // Validate and format
                parsedQuestions.forEach((rawRow, index) => {
                    if (hasError) return;

                    // Normalize keys to handle extra spaces, asterisks, or labels like (Optional)
                    const row: any = {};
                    Object.keys(rawRow).forEach(key => {
                        const cleanKey = key.trim().replace(/\*$/, '').replace(/\(Optional\)$/i, '').trim();
                        row[cleanKey] = rawRow[key];
                    });

                    // Basic validation
                    if (!row['Question Text'] || !row['Option A'] || !row['Option B'] || !row['Option C'] || !row['Option D'] || !row['Correct Option']) {
                        alert(`Error in row ${index + 1}: Missing required fields`);
                        hasError = true;
                        return;
                    }

                    formattedQuestions.push({
                        test_id: id,
                        question_text: row['Question Text'],
                        option_a: row['Option A'],
                        option_b: row['Option B'],
                        option_c: row['Option C'],
                        option_d: row['Option D'],
                        correct_option: row['Correct Option'].toUpperCase() as 'A' | 'B' | 'C' | 'D',
                        marks: parseInt(row['Marks']) || 1,
                        explanation: row['Explanation'] || '',
                        display_order: questions.length + index
                    });
                });

                if (!hasError && formattedQuestions.length > 0) {
                    try {
                        await createQuestions.mutateAsync(formattedQuestions);
                        alert(`Successfully imported ${formattedQuestions.length} questions!`);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    } catch (error) {
                        console.error('Import failed:', error);
                        alert('Failed to import questions. Please check the file format.');
                    }
                }
            },
            error: (error) => {
                console.error('CSV Parse Error:', error);
                alert('Failed to parse CSV file');
            }
        });
    };

    const handleDownloadSample = () => {
        const headers = ['Question Text', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Option', 'Marks', 'Explanation'];
        const sampleData = [
            ['What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C', '1', 'Paris is the capital of France.'],
            ['Which planet is known as the Red Planet?', 'Mars', 'Venus', 'Jupiter', 'Saturn', 'A', '1', 'Mars appears red due to iron oxide.']
        ];

        const csvContent = [
            headers.join(','),
            ...sampleData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'questions_sample.csv';
        link.click();
    };

    // Filter batches by selected exam_goal for the dropdown
    const filteredBatches = allBatches.filter(b =>
        !formData.exam_goal || b.examGoal === formData.exam_goal
    );

    const handleSaveTest = async () => {
        try {
            const payload = {
                ...formData,
                scheduled_date: formData.scheduled_date ? new Date(formData.scheduled_date).toISOString() : null,
                duration: Number(formData.duration),
                total_marks: Number(formData.total_marks),
                passing_marks: Number(formData.passing_marks),
                total_questions: Number(formData.total_questions),
                batch_id: isBatchSpecific && formData.batch_id ? formData.batch_id : null,
            };

            if (isEditMode && id) {
                await updateTest.mutateAsync({ testId: id, updates: payload });
                alert('Test updated successfully!');
            } else {
                // @ts-ignore - Create payload might have different requirements but this should work
                const result = await createTest.mutateAsync(payload);
                alert('Test created successfully! Now add questions.');
                navigate(`/admin/dashboard/tests/${result.id}/edit`);
            }
        } catch (error) {
            console.error('Failed to save test:', error);
            alert('Failed to save test');
        }
    };

    const handleSaveQuestion = async () => {
        if (!id) {
            alert('Please save the test first before adding questions');
            return;
        }

        try {
            if (editingQuestion) {
                await updateQuestion.mutateAsync({
                    questionId: editingQuestion,
                    updates: questionForm
                });
            } else {
                await createQuestion.mutateAsync({
                    test_id: id,
                    ...questionForm,
                    display_order: questions.length
                });
            }

            resetQuestionForm();
        } catch (error) {
            console.error('Failed to save question:', error);
            alert('Failed to save question');
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!id || !confirm('Are you sure you want to delete this question?')) return;

        try {
            await deleteQuestion.mutateAsync({ questionId, testId: id });
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    const handleEditQuestion = (question: any) => {
        setQuestionForm({
            question_text: question.question_text,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            correct_option: question.correct_option,
            marks: question.marks,
            explanation: question.explanation || ''
        });
        setEditingQuestion(question.id);
        setShowQuestionForm(true);
    };

    const resetQuestionForm = () => {
        setQuestionForm({
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 'A',
            marks: 1,
            explanation: ''
        });
        setEditingQuestion(null);
        setShowQuestionForm(false);
    };

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading test...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard/tests')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Test' : 'Create New Test'}
                    </h1>
                    <p className="text-gray-600">Configure test details and questions</p>
                </div>
                <Button onClick={handleSaveTest} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Test
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-6">
                    <button
                        onClick={() => setCurrentTab('details')}
                        className={`pb-3 px-1 font-medium transition-colors border-b-2 ${currentTab === 'details'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Test Details
                    </button>
                    <button
                        onClick={() => setCurrentTab('questions')}
                        className={`pb-3 px-1 font-medium transition-colors border-b-2 ${currentTab === 'questions'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Questions ({questions.length})
                    </button>
                </div>
            </div>

            {/* Test Details Tab */}
            {currentTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="JEE Main 2024 Mock Test 1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded- lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                        rows={3}
                                        placeholder="Detailed description of the test..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Goal *</label>
                                        <select
                                            value={formData.exam_goal}
                                            onChange={(e) => handleChange('exam_goal', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="">Select Goal</option>
                                            <option value="JEE">JEE</option>
                                            <option value="NEET">NEET</option>
                                            <option value="UPSC">UPSC</option>
                                            <option value="Foundation">Foundation</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => handleChange('subject', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Physics"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Configuration */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4">Configuration</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins) *</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks *</label>
                                    <input
                                        type="number"
                                        value={formData.passing_marks}
                                        onChange={(e) => handleChange('passing_marks', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                                    <input
                                        type="number"
                                        value={formData.total_questions}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Auto-calculated from questions</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                                    <input
                                        type="number"
                                        value={formData.total_marks}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Auto-calculated from questions</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4">Publishing</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="mock">Mock Test</option>
                                        <option value="practice">Practice Set</option>
                                        <option value="live">Live Quiz</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => handleChange('difficulty', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Test Scope */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4">Test Scope</h2>
                            <div className="space-y-3">
                                {/* General toggle */}
                                <label
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!isBatchSpecific ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => { setIsBatchSpecific(false); handleChange('batch_id', ''); }}
                                >
                                    <Globe className={`w-5 h-5 ${!isBatchSpecific ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">General</p>
                                        <p className="text-xs text-gray-500">All students of this exam goal</p>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 ${!isBatchSpecific ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                        {!isBatchSpecific && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[3px]" />}
                                    </div>
                                </label>

                                {/* Batch-specific toggle */}
                                <label
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isBatchSpecific ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setIsBatchSpecific(true)}
                                >
                                    <Users className={`w-5 h-5 ${isBatchSpecific ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">Batch Specific</p>
                                        <p className="text-xs text-gray-500">Only students in selected batch</p>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 ${isBatchSpecific ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                                        {isBatchSpecific && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[3px]" />}
                                    </div>
                                </label>

                                {/* Batch dropdown (only when batch-specific is selected) */}
                                {isBatchSpecific && (
                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch *</label>
                                        <select
                                            value={formData.batch_id}
                                            onChange={(e) => handleChange('batch_id', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                                        >
                                            <option value="">Select a batch...</option>
                                            {filteredBatches.map(batch => (
                                                <option key={batch.id} value={batch.id}>
                                                    {batch.title} {batch.examGoal ? `(${batch.examGoal})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {filteredBatches.length === 0 && (
                                            <p className="text-xs text-amber-600 mt-1">No batches found{formData.exam_goal ? ` for ${formData.exam_goal}` : ''}. Create a batch first.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Questions Tab */}
            {currentTab === 'questions' && (
                <div className="space-y-6">
                    {!id && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-amber-800 text-sm">Please save the test first before adding questions.</p>
                        </div>
                    )}

                    {id && (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Import CSV
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleDownloadSample}
                                        title="Download Sample CSV"
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => setShowQuestionForm(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        disabled={showQuestionForm}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Question
                                    </Button>
                                </div>
                            </div>

                            {/* Question Form */}
                            {showQuestionForm && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                                    <h3 className="font-semibold mb-4">{editingQuestion ? 'Edit Question' : 'New Question'}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                                            <textarea
                                                value={questionForm.question_text}
                                                onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                                rows={3}
                                                placeholder="Enter your question here..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Option A *</label>
                                                <input
                                                    type="text"
                                                    value={questionForm.option_a}
                                                    onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Option B *</label>
                                                <input
                                                    type="text"
                                                    value={questionForm.option_b}
                                                    onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Option C *</label>
                                                <input
                                                    type="text"
                                                    value={questionForm.option_c}
                                                    onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Option D *</label>
                                                <input
                                                    type="text"
                                                    value={questionForm.option_d}
                                                    onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Option *</label>
                                                <select
                                                    value={questionForm.correct_option}
                                                    onChange={(e) => setQuestionForm({ ...questionForm, correct_option: e.target.value as any })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                                >
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
                                                <input
                                                    type="number"
                                                    value={questionForm.marks}
                                                    onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                    min="1"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                                            <textarea
                                                value={questionForm.explanation}
                                                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                                rows={2}
                                                placeholder="Explain the correct answer..."
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button onClick={handleSaveQuestion} className="bg-indigo-600 hover:bg-indigo-700">
                                                <Check className="w-4 h-4 mr-2" />
                                                {editingQuestion ? 'Update' : 'Add'} Question
                                            </Button>
                                            <Button onClick={resetQuestionForm} variant="outline">
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Questions List */}
                            <div className="space-y-3">
                                {questions.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
                                    </div>
                                ) : (
                                    questions.map((q, index) => (
                                        <div key={q.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">
                                                            Q{index + 1}
                                                        </span>
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                                                            {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-gray-900">{q.question_text}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditQuestion(q)}
                                                        disabled={showQuestionForm}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className={`p-2 rounded ${q.correct_option === 'A' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                                    <span className="font-medium">A.</span> {q.option_a}
                                                </div>
                                                <div className={`p-2 rounded ${q.correct_option === 'B' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                                    <span className="font-medium">B.</span> {q.option_b}
                                                </div>
                                                <div className={`p-2 rounded ${q.correct_option === 'C' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                                    <span className="font-medium">C.</span> {q.option_c}
                                                </div>
                                                <div className={`p-2 rounded ${q.correct_option === 'D' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                                    <span className="font-medium">D.</span> {q.option_d}
                                                </div>
                                            </div>
                                            {q.explanation && (
                                                <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                                                    <span className="font-medium text-blue-900">Explanation:</span> <span className="text-blue-700">{q.explanation}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
