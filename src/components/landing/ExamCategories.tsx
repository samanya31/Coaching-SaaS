import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

interface Category {
    title: string;
    tags: string[];
    arcColor: string;
    icon: string;
}

const categories: Category[] = [
    {
        title: 'NEET',
        tags: ['class 11', 'class 12', 'Dropper'],
        arcColor: 'bg-[#FFF5F5]', // Light pinkish
        icon: '👨‍⚕️'
    },
    {
        title: 'IIT JEE',
        tags: ['class 11', 'class 12', 'Dropper'],
        arcColor: 'bg-[#FFF8E1]', // Light orange/yellow
        icon: '⚛️'
    },
    {
        title: 'Pre Foundation',
        tags: [],
        arcColor: 'bg-[#FFFBE6]', // Light yellow
        icon: '🎒'
    },
    {
        title: 'School Boards',
        tags: ['CBSE', 'ICSE', 'UP Board', 'Maharashtra Board'],
        arcColor: 'bg-[#F3F0FF]', // Light purple
        icon: '📚'
    },
    {
        title: 'UPSC',
        tags: [],
        arcColor: 'bg-[#F0F9FF]', // Light blue
        icon: '🏛️'
    },
    {
        title: 'Govt Job Exams',
        tags: ['SSC', 'Banking', 'Teaching', 'Judiciary'],
        arcColor: 'bg-[#F5F5F5]', // Light gray
        icon: '💼'
    }
];

export const ExamCategories = () => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    return (
        <section className="pt-40 pb-20 bg-gradient-to-b from-gray-50 to-white relative z-10">
            <div className="container-custom" ref={ref}>
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Exam Categories
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        PW is preparing students for 35+ exam categories. Scroll down to find yours!
                    </p>
                </motion.div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group"
                        >
                            <Link to="/courses" className="block h-full">
                                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden h-[240px] flex flex-col justify-between">

                                    {/* Content Container - z-10 to sit above arc */}
                                    <div className="relative z-10 flex flex-col h-full items-start w-[70%]">

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                            {category.title}
                                        </h3>

                                        {/* Tags */}
                                        {category.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-auto content-start">
                                                {category.tags.map((tag, i) => (
                                                    <span key={i} className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1 bg-white whitespace-nowrap">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Explore Link */}
                                        <div className="flex items-center gap-2 text-gray-900 text-sm font-semibold mt-auto group-hover:gap-3 transition-all">
                                            <span>Explore Category</span>
                                            <div className="bg-white border rounded-full p-1 shadow-sm">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decoration Arc Right Side */}
                                    <div className={`absolute top-0 right-0 w-[35%] h-full ${category.arcColor} rounded-l-[100px] transition-transform duration-500 group-hover:scale-110 origin-right`}>
                                        {/* Icon Centered in Arc */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl">
                                            {category.icon}
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
