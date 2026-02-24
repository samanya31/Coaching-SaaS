import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Users, Trophy, BookOpen, Target } from 'lucide-react';

interface StatItem {
    icon: React.ElementType;
    value: number;
    suffix: string;
    label: string;
    color: string;
    bgColor: string;
}

const stats: StatItem[] = [
    {
        icon: Users,
        value: 50000,
        suffix: '+',
        label: 'Happy Students',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
    },
    {
        icon: Trophy,
        value: 1200,
        suffix: '+',
        label: 'Selections in 2024',
        color: 'text-amber-600',
        bgColor: 'bg-amber-100'
    },
    {
        icon: BookOpen,
        value: 500,
        suffix: '+',
        label: 'Expert Educators',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
    },
    {
        icon: Target,
        value: 95,
        suffix: '%',
        label: 'Success Rate',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
    }
];

export const TrustStats = () => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    return (
        <section className="py-20 bg-white" ref={ref}>
            <div className="container-custom">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Trusted by <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Thousands</span> of Students
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Join the community of successful students who achieved their dreams with us
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: "easeOut"
                                }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="relative group cursor-pointer"
                            >
                                {/* Card */}
                                <div className={`${stat.bgColor} rounded-3xl p-8 text-center transition-all duration-300 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-${stat.color.replace('text-', '')}`}>
                                    {/* Icon */}
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.2 }}
                                        transition={{ duration: 0.6 }}
                                        className={`${stat.color} w-16 h-16 mx-auto mb-6 rounded-2xl ${stat.bgColor.replace('100', '200')} flex items-center justify-center shadow-lg`}
                                    >
                                        <Icon className="w-8 h-8" strokeWidth={2.5} />
                                    </motion.div>

                                    {/* Number with Count Up */}
                                    <div className={`text-5xl md:text-6xl font-extrabold ${stat.color} mb-2`}>
                                        {inView && (
                                            <CountUp
                                                start={0}
                                                end={stat.value}
                                                duration={2.5}
                                                suffix={stat.suffix}
                                                separator=","
                                            />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <p className="text-gray-700 font-semibold text-lg">
                                        {stat.label}
                                    </p>

                                    {/* Animated underline on hover */}
                                    <div className={`h-1 ${stat.bgColor.replace('100', '400')} mt-4 mx-auto w-0 group-hover:w-full transition-all duration-300 rounded-full`} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
