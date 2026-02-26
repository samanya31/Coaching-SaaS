import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, GraduationCap, FileText, Video } from 'lucide-react';

export const BottomNavigation = () => {
    const location = useLocation();

    const navItems = [
        { path: '/student/dashboard', icon: Home, label: 'Home' },
        { path: '/student/dashboard/batches', icon: GraduationCap, label: 'Batches' },
        { path: '/student/dashboard/courses', icon: BookOpen, label: 'Courses' },
        { path: '/student/dashboard/live-classes', icon: Video, label: 'Live Classes' },
        { path: '/student/dashboard/tests', icon: FileText, label: 'Tests' },
    ];

    // Hide on login page - navigation will be shown after login
    if (location.pathname === '/student/login') {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 safe-area-bottom">
            <div className="flex items-center justify-around px-1 py-2">
                {navItems.map((item) => {
                    const isActive = location.pathname.includes(item.path) && (item.path !== '/student/dashboard' || location.pathname === '/student/dashboard');
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex-1 flex flex-col items-center gap-1 py-1 px-1 relative overflow-hidden"
                            title={item.label}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-x-2 top-0 bottom-0 bg-blue-50 rounded-xl"
                                    transition={{ type: 'spring', duration: 0.5 }}
                                />
                            )}
                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <item.icon
                                    className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${isActive ? 'text-[#1E3A8A] stroke-[2.5]' : 'text-[#6B7280] stroke-2'
                                        }`}
                                />
                                <span
                                    className={`text-[9px] sm:text-[10px] md:text-xs font-semibold text-center leading-tight whitespace-nowrap ${isActive ? 'text-[#1E3A8A]' : 'text-[#6B7280]'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

