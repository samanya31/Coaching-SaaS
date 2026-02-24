import { motion } from 'framer-motion';
import { useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface Topper {
    rank: number;
    name: string;
    exam: string;
    score: string;
    image: string;
}

const examTabs = ['JEE', 'NEET', 'UPSC', 'SSC'];

const toppers: Record<string, Topper[]> = {
    JEE: [
        { rank: 1, name: 'Aarav Sharma', exam: 'JEE Advanced 2024', score: '342/360', image: '👨‍🎓' },
        { rank: 2, name: 'Priya Patel', exam: 'JEE Advanced 2024', score: '338/360', image: '👩‍🎓' },
        { rank: 3, name: 'Rohan Kumar', exam: 'JEE Advanced 2024', score: '335/360', image: '👨‍🎓' },
    ],
    NEET: [
        { rank: 1, name: 'Ananya Reddy', exam: 'NEET 2024', score: '715/720', image: '👩‍🎓' },
        { rank: 2, name: 'Arjun Singh', exam: 'NEET 2024', score: '710/720', image: '👨‍🎓' },
        { rank: 3, name: 'Kavya Iyer', exam: 'NEET 2024', score: '705/720', image: '👩‍🎓' },
    ],
    UPSC: [
        { rank: 1, name: 'Rahul Verma', exam: 'UPSC CSE 2024', score: 'AIR 1', image: '👨‍🎓' },
        { rank: 2, name: 'Sneha Gupta', exam: 'UPSC CSE 2024', score: 'AIR 2', image: '👩‍🎓' },
        { rank: 3, name: 'Vikram Joshi', exam: 'UPSC CSE 2024', score: 'AIR 3', image: '👨‍🎓' },
    ],
    SSC: [
        { rank: 1, name: 'Amit Das', exam: 'SSC CGL 2024', score: '98.5%', image: '👨‍🎓' },
        { rank: 2, name: 'Ritu Mehta', exam: 'SSC CGL 2024', score: '97.8%', image: '👩‍🎓' },
        { rank: 3, name: 'Kiran Nair', exam: 'SSC CGL 2024', score: '96.9%', image: '👩‍🎓' },
    ],
};

export const ResultsSection = () => {
    const [activeTab, setActiveTab] = useState('JEE');
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    return (
        <section
            className="py-20 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #FFF9F0 0%, #FFF5E6 50%, #FFEAD9 100%)'
            }}
        >
            <div className="container-custom" ref={ref}>
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Our <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Star Performers</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Celebrating the success of our brilliant students who cleared top competitive exams
                    </p>
                </motion.div>

                {/* Exam Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex justify-center gap-4 mb-12 flex-wrap"
                >
                    {examTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${activeTab === tab
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </motion.div>

                {/* Toppers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {toppers[activeTab].map((topper, index) => (
                        <motion.div
                            key={`${activeTab}-${index}`}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                ease: "easeOut"
                            }}
                            whileHover={{ y: -8, scale: 1.05 }}
                            className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-amber-100 relative overflow-hidden group"
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-4 right-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                            'bg-gradient-to-r from-orange-400 to-orange-500'
                                    }`}>
                                    {topper.rank}
                                </div>
                            </div>

                            {/* Topper Avatar */}
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-6xl shadow-lg">
                                    {topper.image}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{topper.name}</h3>
                                <p className="text-sm text-gray-600">{topper.exam}</p>
                            </div>

                            {/* Score */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-semibold text-gray-600">Score</span>
                                </div>
                                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    {topper.score}
                                </p>
                            </div>

                            {/* Hover Effect Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </motion.div>
                    ))}
                </div>

                {/* Success Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
                >
                    {[
                        { icon: TrendingUp, value: '95%', label: 'Success Rate' },
                        { icon: Award, value: '1200+', label: 'Selections' },
                        { icon: TrendingUp, value: '500+', label: 'Top 100 Ranks' },
                        { icon: Award, value: '50+', label: 'Top 10 Ranks' },
                    ].map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg">
                                <Icon className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                <p className="text-sm text-gray-600">{stat.label}</p>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
