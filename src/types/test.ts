export interface TestQuestion {
    id: string;
    test_id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
    marks: number;
    display_order: number;
    explanation: string | null;
    created_at: string;
    updated_at: string;
}

export interface StudentAttempt {
    id: string;
    test_id: string;
    student_id: string;
    coaching_id: string;
    answers: Record<string, string>; // {question_id: 'A'}
    score: number;
    total_marks: number;
    percentage: number;
    status: 'in_progress' | 'submitted';
    started_at: string;
    submitted_at: string | null;
    time_taken: number | null; // in seconds
    created_at: string;
    updated_at: string;
}

export interface CreateQuestionInput {
    test_id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
    marks?: number;
    display_order?: number;
    explanation?: string;
}

export interface CreateAttemptInput {
    test_id: string;
    total_marks: number;
}

export interface UpdateAttemptInput {
    answers?: Record<string, string>;
    status?: 'in_progress' | 'submitted';
    time_taken?: number;
}
