// ===== TYPE DEFINITIONS =====

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  mode: string;
  price: number;
  originalPrice: number;
  image: string;
}

export interface Faculty {
  id: string;
  name: string;
  subject: string;
  experience: string;
  image: string;
  qualification: string;
  qualifications: string;
  students: number;
}

export interface Achievement {
  id: number;
  name: string;
  rank: string;
  exam: string;
  image: string;
  quote: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  content: string;
  avatar: string;
  rating: number;
}

// ===== PUBLIC WEBSITE DATA =====

export const stats = [
  { value: 1200, suffix: '+', label: 'Students Enrolled' },
  { value: 95, suffix: '%', label: 'Success Rate' },
  { value: 50, suffix: '+', label: 'Expert Faculty' },
];

export const categories = [
  'All',
  'UPSC',
  'SSC',
  'Banking',
  'Railway',
  'State PSC'
];

export const courses = [
  {
    id: '1',
    title: 'UPSC Civil Services',
    description: 'Comprehensive preparation program for IAS, IPS, and IFS examinations',
    category: 'UPSC',
    duration: '12 months',
    students: 450,
    rating: 4.8,
    mode: 'Online',
    price: 50000,
    originalPrice: 75000,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    title: 'SSC CGL',
    description: 'Complete course for Staff Selection Commission Combined Graduate Level',
    category: 'SSC',
    duration: '6 months',
    students: 380,
    rating: 4.7,
    mode: 'Online',
    price: 25000,
    originalPrice: 35000,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    title: 'Banking & Insurance',
    description: 'Specialized training for IBPS, SBI PO, and insurance exams',
    category: 'Banking',
    duration: '4 months',
    students: 320,
    rating: 4.9,
    mode: 'Offline',
    price: 20000,
    originalPrice: 30000,
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    title: 'UPSC Mains',
    description: 'Advanced preparation for UPSC Mains examination',
    category: 'UPSC',
    duration: '8 months',
    students: 280,
    rating: 4.8,
    mode: 'Hybrid',
    price: 40000,
    originalPrice: 55000,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    title: 'Railway Group D',
    description: 'Complete preparation for Railway Group D examinations',
    category: 'Railway',
    duration: '3 months',
    students: 420,
    rating: 4.6,
    mode: 'Online',
    price: 15000,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop'
  },
  {
    id: '6',
    title: 'State PSC',
    description: 'Comprehensive course for State Public Service Commission exams',
    category: 'State PSC',
    duration: '10 months',
    students: 350,
    rating: 4.7,
    mode: 'Hybrid',
    price: 35000,
    originalPrice: 50000,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop'
  },
];

export const faculty = [
  {
    id: '1',
    name: 'Dr. Arun Kumar',
    subject: 'Indian Polity & Governance',
    experience: '15 years',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    qualification: 'PhD in Political Science',
    qualifications: 'PhD in Political Science',
    students: 5000
  },
  {
    id: '2',
    name: 'Prof. Meera Singh',
    subject: 'Geography & Environment',
    experience: '12 years',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
    qualification: 'M.A. Geography, Gold Medalist',
    qualifications: 'M.A. Geography, Gold Medalist',
    students: 4200
  },
  {
    id: '3',
    name: 'Rajesh Verma',
    subject: 'Current Affairs & Economics',
    experience: '10 years',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    qualification: 'MBA, Former Civil Servant',
    qualifications: 'MBA, Former Civil Servant',
    students: 3800
  },
];

export const testimonials = [
  {
    id: '1',
    name: 'Priya Sharma',
    position: 'IAS Rank 45, 2023',
    content: 'The guidance and resources provided were instrumental in my success. The faculty are exceptionally knowledgeable.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5
  },
  {
    id: '2',
    name: 'Amit Patel',
    position: 'SSC CGL, 2023',
    content: 'Best coaching institute in the state. The structured approach and regular tests helped me stay on track.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5
  },
  {
    id: '3',
    name: 'Sneha Reddy',
    position: 'SBI PO, 2023',
    content: 'Excellent teaching methods and comprehensive study material. Highly recommend to all aspirants.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5
  },
];

export const whyChooseUs = [
  {
    icon: 'Users',
    title: 'Expert Faculty',
    description: 'Learn from experienced educators with proven track records'
  },
  {
    icon: 'BookOpen',
    title: 'Comprehensive Material',
    description: 'Access to extensive study resources and practice tests'
  },
  {
    icon: 'Trophy',
    title: 'Proven Results',
    description: '95% success rate with students in top ranks'
  },
  {
    icon: 'Video',
    title: 'Live Classes',
    description: 'Interactive online sessions with doubt clearing'
  },
];

export const demoClasses = [
  {
    id: '1',
    title: 'UPSC Strategy Session',
    instructor: 'Dr. Arun Kumar',
    date: '2024-02-10',
    time: '10:00 AM - 11:30 AM',
    category: 'UPSC',
    seats: 50,
    enrolled: 35,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
    description: 'Learn effective strategies for UPSC preparation'
  },
  {
    id: '2',
    title: 'SSC CGL Math Tricks',
    instructor: 'Prof. Meera Singh',
    date: '2024-02-12',
    time: '03:00 PM - 04:30 PM',
    category: 'SSC',
    seats: 40,
    enrolled: 28,
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    description: 'Master quick calculation techniques for competitive exams'
  },
  {
    id: '3',
    title: 'Banking Exam Overview',
    instructor: 'Rajesh Verma',
    date: '2024-02-15',
    time: '11:00 AM - 12:30 PM',
    category: 'Banking',
    seats: 45,
    enrolled: 30,
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
    description: 'Complete roadmap for banking and insurance exams'
  },
];

export const pricingPlans = [
  {
    id: '1',
    name: 'Basic',
    price: '₹9,999',
    duration: '/3 months',
    features: [
      'Access to recorded lectures',
      'Study material (PDF)',
      'Weekly tests',
      'Email support',
      'Mobile app access'
    ],
    popular: false
  },
  {
    id: '2',
    name: 'Standard',
    price: '₹24,999',
    duration: '/6 months',
    features: [
      'All Basic features',
      'Live classes',
      'Daily practice questions',
      'Performance analytics',
      'Chat support',
      'Doubt clearing sessions'
    ],
    popular: true
  },
  {
    id: '3',
    name: 'Premium',
    price: '₹49,999',
    duration: '/12 months',
    features: [
      'All Standard features',
      'One-on-one mentorship',
      'Interview preparation',
      'Unlimited test series',
      'Priority support',
      'Personalized study plan',
      'Career guidance'
    ],
    popular: false
  },
];

// ... (previous content)

export const achievements = [
  {
    id: 1,
    name: "Rohan Kumar",
    rank: "AIR 15",
    exam: "UPSC CSE 2023",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop",
    quote: "Vidya Yantra's mentorship was crucial in my success journey."
  },
  {
    id: 2,
    name: "Priya Singh",
    rank: "AIR 1",
    exam: "SSC CGL 2023",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    quote: "The test series and analysis helped me improve my weak areas."
  },
  {
    id: 3,
    name: "Amit Patel",
    rank: "Rank 5",
    exam: "State PCS 2023",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    quote: "Comprehensive study material and regular guidance were key."
  },
  {
    id: 4,
    name: "Sneha Reddy",
    rank: "Top 0.1%",
    exam: "Banking 2023",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    quote: "The faculty's support motivated me to push my limits."
  },
];

// ===== STUDENT PORTAL DATA =====

export const mockCourses = [
  {
    id: '1',
    title: 'UPSC Prelims 2024 - Complete Course',
    instructor: 'Dr. Arun Kumar',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    progress: 65,
    totalLessons: 120,
    completedLessons: 78,
    lastAccessed: '2024-01-28',
    category: 'UPSC',
    videoUrl: 'https://nsdfiles.b-cdn.net/IndrAJEET.mp4'
  },
  {
    id: '2',
    title: 'General Studies - Paper 1',
    instructor: 'Prof. Meera Singh',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    progress: 42,
    totalLessons: 80,
    completedLessons: 34,
    lastAccessed: '2024-01-27',
    category: 'UPSC',
    videoUrl: 'https://nsdfiles.b-cdn.net/IndrAJEET.mp4'
  },
  {
    id: '3',
    title: 'Current Affairs Monthly',
    instructor: 'Rajesh Verma',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
    progress: 88,
    totalLessons: 30,
    completedLessons: 26,
    lastAccessed: '2024-01-29',
    category: 'Current Affairs',
    videoUrl: 'https://nsdfiles.b-cdn.net/IndrAJEET.mp4'
  },
  {
    id: '4',
    title: 'Essay Writing Masterclass',
    instructor: 'Dr. Priya Nair',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
    progress: 25,
    totalLessons: 24,
    completedLessons: 6,
    lastAccessed: '2024-01-25',
    category: 'Skills',
    videoUrl: 'https://nsdfiles.b-cdn.net/IndrAJEET.mp4'
  }
];

export const mockLiveClasses = [
  {
    id: '1',
    subject: 'Indian Polity',
    topic: 'Fundamental Rights - Deep Dive',
    faculty: 'Dr. Arun Kumar',
    facultyAvatar: 'AK',
    date: '2024-02-03',
    time: '10:00 AM',
    duration: '2 hours',
    status: 'upcoming' as const,
    meetingLink: 'https://zoom.us/j/123456789',
    youtubeVideoId: 'dQw4w9WgXcQ' // Replace with actual YouTube Live video ID
  },
  {
    id: '2',
    subject: 'World Geography',
    topic: 'Climate Change & Global Warming',
    faculty: 'Prof. Meera Singh',
    facultyAvatar: 'MS',
    date: '2024-02-03',
    time: '03:00 PM',
    duration: '1.5 hours',
    status: 'upcoming' as const,
    meetingLink: 'https://zoom.us/j/987654321',
    youtubeVideoId: 'jNQXAC9IVRw' // Replace with actual YouTube Live video ID
  },
  {
    id: '3',
    subject: 'Current Affairs',
    topic: 'Budget 2024 Analysis',
    faculty: 'Rajesh Verma',
    facultyAvatar: 'RV',
    date: '2024-02-04',
    time: '11:00 AM',
    duration: '1 hour',
    status: 'upcoming' as const,
    meetingLink: 'https://zoom.us/j/456789123',
    youtubeVideoId: '_Z5OookwLXI' // Replace with actual YouTube Live video ID
  }
];

export const mockTests = [
  {
    id: '1',
    title: 'UPSC Prelims Mock Test - 15',
    type: 'Full Length',
    duration: '120 minutes',
    questions: 100,
    totalMarks: 200,
    difficulty: 'Medium' as const,
    attempted: false,
    scheduledDate: '2024-02-05'
  },
  {
    id: '2',
    title: 'Indian History - Sectional Test',
    type: 'Sectional',
    duration: '60 minutes',
    questions: 50,
    totalMarks: 100,
    difficulty: 'Easy' as const,
    attempted: true,
    score: 78,
    accuracy: 78,
    rank: 45,
    totalAttempts: 1240,
    attemptedDate: '2024-01-28'
  },
  {
    id: '3',
    title: 'Geography & Environment',
    type: 'Sectional',
    duration: '45 minutes',
    questions: 40,
    totalMarks: 80,
    difficulty: 'Hard' as const,
    attempted: true,
    score: 62,
    accuracy: 77.5,
    rank: 120,
    totalAttempts: 980,
    attemptedDate: '2024-01-25'
  },
  {
    id: '4',
    title: 'Current Affairs - Weekly Test',
    type: 'Weekly',
    duration: '30 minutes',
    questions: 30,
    totalMarks: 60,
    difficulty: 'Medium' as const,
    attempted: false,
    scheduledDate: '2024-02-06'
  }
];

export const mockMaterials = [
  {
    id: '1',
    name: 'Indian Polity - Complete Notes',
    type: 'PDF',
    size: '12.5 MB',
    category: 'Notes',
    subject: 'Polity',
    uploadDate: '2024-01-20',
    downloads: 1240
  },
  {
    id: '2',
    name: 'Previous Year Papers 2015-2023',
    type: 'PDF',
    size: '45.2 MB',
    category: 'Previous Papers',
    subject: 'All Subjects',
    uploadDate: '2024-01-15',
    downloads: 3450
  },
  {
    id: '3',
    name: 'Geography Mind Maps',
    type: 'PDF',
    size: '8.7 MB',
    category: 'Mind Maps',
    subject: 'Geography',
    uploadDate: '2024-01-22',
    downloads: 890
  },
  {
    id: '4',
    name: 'Current Affairs January 2024',
    type: 'PDF',
    size: '15.3 MB',
    category: 'Current Affairs',
    subject: 'Current Affairs',
    uploadDate: '2024-02-01',
    downloads: 2100
  }
];

export const mockPerformanceData = [
  { month: 'Aug', score: 45 },
  { month: 'Sep', score: 52 },
  { month: 'Oct', score: 58 },
  { month: 'Nov', score: 65 },
  { month: 'Dec', score: 72 },
  { month: 'Jan', score: 78 },
];
