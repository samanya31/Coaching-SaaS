export interface Banner {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    isActive: boolean;
    displayOrder: number;
    startDate?: Date;
    endDate?: Date;
    targetAudience: 'All' | 'JEE' | 'NEET' | 'UPSC' | 'Foundation';
    type: 'public' | 'student';
}


export const banners: Banner[] = [
    {
        id: '1',
        title: 'JEE Advanced 2025 Crash Course',
        description: 'Last minute preparation booster for JEE Advanced aspirants. 50% OFF for early birds!',
        imageUrl: 'https://images.unsplash.com/photo-1620912189865-1e8a33f4c087?auto=format&fit=crop&q=80&w=2069',
        ctaText: 'Enroll Now',
        ctaLink: '/courses/jee-adv-2025',
        isActive: true,
        displayOrder: 1,
        startDate: new Date('2025-01-01'),
        targetAudience: 'JEE',
        type: 'student'
    },
    {
        id: '2',
        title: 'NEET Biology Masterclass',
        description: 'Master Biology with Dr. Sharma. Complete NCERT coverage in 30 days.',
        imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=2080',
        ctaText: 'Start Learning',
        ctaLink: '/courses/neet-bio-master',
        isActive: true,
        displayOrder: 2,
        targetAudience: 'NEET',
        type: 'student'
    },
    {
        id: '3',
        title: 'UPSC Prelims Test Series',
        description: 'All India Mock Test Series for UPSC CSE 2025. Test your preparation now.',
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-4a8b643beeae?auto=format&fit=crop&q=80&w=2070',
        ctaText: 'Take Test',
        ctaLink: '/tests/upsc-prelims',
        isActive: true,
        displayOrder: 3,
        endDate: new Date('2025-05-30'),
        targetAudience: 'UPSC',
        type: 'student'
    },
    {
        id: '4',
        title: 'Scholarship Test 2025',
        description: 'Win up to 100% scholarship on all courses. Register for the scholarship test today.',
        imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=2071',
        ctaText: 'Register Free',
        ctaLink: '/scholarship',
        isActive: false,
        displayOrder: 4,
        startDate: new Date('2025-06-01'),
        targetAudience: 'All',
        type: 'public'
    }
];

export const getBannerById = (id: string): Banner | undefined => {
    return banners.find(banner => banner.id === id);
};
