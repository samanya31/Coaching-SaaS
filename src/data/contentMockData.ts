export interface VideoContent {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    videoUrl: string;

    subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'General' | 'Reasoning';
    views: number;
    uploadDate: Date;
    linkedBatchIds: string[]; // IDs of batches this video is assigned to
    status: 'published' | 'draft' | 'archived';
}

export const contentData: VideoContent[] = [
    {
        id: '1',
        title: 'Newton\'s Laws of Motion - Deep Dive',
        description: 'Comprehensive explanation of all three laws of motion with real-world examples and problem solving.',
        thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=2000',
        videoUrl: 'https://www.youtube.com/watch?v=kKKM8Y-u7ds',

        subject: 'Physics',
        views: 1250,
        uploadDate: new Date('2025-01-15'),
        linkedBatchIds: ['jee-2025-complete', 'neet-2025-complete'],
        status: 'published'
    },
    {
        id: '2',
        title: 'Organic Chemistry - Reaction Mechanisms',
        description: 'Understanding SN1 and SN2 reaction mechanisms with detailed step-by-step breakdown.',
        thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&q=80&w=2000',
        videoUrl: 'https://www.youtube.com/watch?v=EqsEwQz6y4U',

        subject: 'Chemistry',
        views: 980,
        uploadDate: new Date('2025-01-20'),
        linkedBatchIds: ['jee-2025-complete', 'neet-2025-complete'],
        status: 'published'
    },
    {
        id: '3',
        title: 'Calculus - Limits and Continuity',
        description: 'Introduction to limits, continuity, and their applications in calculus.',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=2000',
        videoUrl: 'https://www.youtube.com/watch?v=Ri8Dv63qfAA',

        subject: 'Mathematics',
        views: 1540,
        uploadDate: new Date('2025-02-01'),
        linkedBatchIds: ['jee-2025-complete'],
        status: 'published'
    },
    {
        id: '4',
        title: 'Cell Biology - Structure and Function',
        description: 'Detailed look at cell organelles, their functions, and cellular processes.',
        thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=2000',
        videoUrl: 'https://www.youtube.com/watch?v=URUJD5NEXC8',

        subject: 'Biology',
        views: 2100,
        uploadDate: new Date('2025-02-05'),
        linkedBatchIds: ['neet-2025-complete'],
        status: 'published'
    },
    {
        id: '5',
        title: 'Integration Techniques Masterclass',
        description: 'Advanced techniques for solving complex integration problems for JEE Advanced.',
        thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&q=80&w=2000',
        videoUrl: 'https://www.youtube.com/watch?v=d_2y_v9zJm8',

        subject: 'Mathematics',
        views: 850,
        uploadDate: new Date('2025-02-08'),
        linkedBatchIds: [],
        status: 'draft'
    }
];

export const getContentById = (id: string): VideoContent | undefined => {
    return contentData.find(content => content.id === id);
};
