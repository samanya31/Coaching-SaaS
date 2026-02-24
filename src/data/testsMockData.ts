
export type TestType = 'mock' | 'practice' | 'live';
export type TestStatus = 'draft' | 'published' | 'archived';
export type TestDifficulty = 'easy' | 'medium' | 'hard';

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctOption: number; // 0-3
    marks: number;
    negativeMarks: number;
}

export interface Test {
    id: string;
    title: string;
    type: TestType;
    examGoal: string; // 'JEE', 'NEET', etc.
    subject: string;
    duration: number; // in minutes
    totalMarks: number;
    passingMarks: number;
    totalQuestions: number;
    difficulty: TestDifficulty;
    status: TestStatus;
    scheduledDate?: Date;
    questions?: Question[];
    attempts: number;
    description: string;
}

export const tests: Test[] = [
    {
        id: 'TEST-001',
        title: 'JEE Main Full Mock Test 1',
        type: 'mock',
        examGoal: 'JEE',
        subject: 'All',
        duration: 180,
        totalMarks: 300,
        passingMarks: 100,
        totalQuestions: 90,
        difficulty: 'medium',
        status: 'published',
        scheduledDate: new Date('2025-03-15T09:00:00'),
        attempts: 1240,
        description: 'Full syllabus mock test for JEE Main 2025 aspirants covering Physics, Chemistry, and Mathematics.'
    },
    {
        id: 'TEST-002',
        title: 'NEET Biology Chapter Test - Cell',
        type: 'practice',
        examGoal: 'NEET',
        subject: 'Biology',
        duration: 45,
        totalMarks: 180,
        passingMarks: 60,
        totalQuestions: 45,
        difficulty: 'easy',
        status: 'published',
        attempts: 856,
        description: 'Chapter-wise practice test for Cell Structure and Function.'
    },
    {
        id: 'TEST-003',
        title: 'UPSC CSAT Practice Set',
        type: 'practice',
        examGoal: 'UPSC',
        subject: 'CSAT',
        duration: 120,
        totalMarks: 200,
        passingMarks: 66,
        totalQuestions: 80,
        difficulty: 'hard',
        status: 'draft',
        attempts: 0,
        description: 'Practice set for UPSC Prelims Paper 2 (CSAT).'
    },
    {
        id: 'TEST-004',
        title: 'Physics - Mechanics Live Quiz',
        type: 'live',
        examGoal: 'JEE',
        subject: 'Physics',
        duration: 60,
        totalMarks: 100,
        passingMarks: 35,
        totalQuestions: 25,
        difficulty: 'medium',
        status: 'published',
        scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
        attempts: 0,
        description: 'Live quiz on Mechanics. Join to compete with peers in real-time.'
    },
    {
        id: 'TEST-005',
        title: 'Board Exam Prep - Mathematics',
        type: 'mock',
        examGoal: 'School Boards',
        subject: 'Mathematics',
        duration: 180,
        totalMarks: 80,
        passingMarks: 27,
        totalQuestions: 35,
        difficulty: 'medium',
        status: 'archived',
        attempts: 450,
        description: 'Previous year question paper mock for Class 12 Boards.'
    }
];
