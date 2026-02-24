import { motion } from 'framer-motion';
import { Radio, FileCheck, HelpCircle, Building2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface Feature {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    badge?: string;
    color: string;
    iconBg: string;
}

const features: Feature[] = [
    {
        icon: Radio,
        title: 'Daily Live',
        subtitle: 'Interactive classes',
        badge: 'LIVE',
        color: 'text-red-500',
        iconBg: 'bg-red-100'
    },
    {
        icon: FileCheck,
        title: '10 Million +',
        subtitle: 'Tests, sample papers & notes',
        color: 'text-blue-500',
        iconBg: 'bg-blue-100'
    },
    {
        icon: HelpCircle,
        title: '24 x 7',
        subtitle: 'Doubt solving sessions',
        color: 'text-purple-500',
        iconBg: 'bg-purple-100'
    },
    {
        icon: Building2,
        title: '100 +',
        subtitle: 'Offline centres',
        color: 'text-yellow-600',
        iconBg: 'bg-yellow-100'
    }
];

interface FeaturesGridProps {
    isInsideCard?: boolean;
}

export const FeaturesGrid = ({ isInsideCard = false }: FeaturesGridProps) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1
    });

    // If used inside ValueProposition card, render without background
    if (isInsideCard) {
        return (
            <div className="p-8 md:p-12" ref={ref}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: "easeOut"
                                }}
                                whileHover={{ y: -4 }}
                                className="text-center relative group cursor-pointer"
                            >
                                {/* Badge for LIVE */}
                                {feature.badge && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse z-10">
                                        {feature.badge}
                                    </span>
                                )}

                                {/* Icon Container */}
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.3 }}
                                    className={`${feature.iconBg} ${feature.color} w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                                >
                                    <Icon className="w-8 h-8" strokeWidth={2.5} />
                                </motion.div>

                                {/* Title */}
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                    {feature.title}
                                </h3>

                                {/* Subtitle */}
                                <p className="text-sm text-gray-600 leading-snug">
                                    {feature.subtitle}
                                </p>

                                {/* Vertical divider (except last item on desktop) */}
                                {index < features.length - 1 && (
                                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gray-200" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Standalone version with gradient background (for backward compatibility)
    return (
        <section
            className="py-20 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #F3F1FF 0%, #EEF2FF 40%, #E6EEF5 100%)'
            }}
        >
            <div className="container-custom" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-6xl mx-auto"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={inView ? { opacity: 1, y: 0 } : {}}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                        ease: "easeOut"
                                    }}
                                    whileHover={{ y: -4 }}
                                    className="text-center relative group cursor-pointer"
                                >
                                    {feature.badge && (
                                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse z-10">
                                            {feature.badge}
                                        </span>
                                    )}

                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.3 }}
                                        className={`${feature.iconBg} ${feature.color} w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                                    >
                                        <Icon className="w-8 h-8" strokeWidth={2.5} />
                                    </motion.div>

                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                        {feature.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 leading-snug">
                                        {feature.subtitle}
                                    </p>

                                    {index < features.length - 1 && (
                                        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gray-200" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
