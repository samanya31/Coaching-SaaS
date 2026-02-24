import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, BookOpen, FolderOpen, User } from 'lucide-react';

export const BottomNavigation = () => {
    const location = useLocation();

    const navItems = [
        { path: '/student/dashboard', icon: Home, label: 'Home' },
        { path: '/student/dashboard/batches', icon: Search, label: 'Batches' },
        { path: '/student/dashboard/courses', icon: BookOpen, label: 'Courses' },
        { path: '/student/dashboard/materials', icon: FolderOpen, label: 'Current Affairs' },
        { path: '/student/dashboard/profile', icon: User, label: 'Profile' },
    ];

    // Hide on login page - navigation will be shown after login
    if (location.pathname === '/student/login') {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex-1 flex flex-col items-center gap-1 py-2 px-1 relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-50 rounded-xl"
                                    transition={{ type: 'spring', duration: 0.5 }}
                                />
                            )}
                            <div className="relative z-10">
                                <item.icon
                                    className={`w-6 h-6 ${isActive ? 'text-[#1E3A8A]' : 'text-[#6B7280]'
                                        }`}
                                />
                            </div>
                            <span
                                className={`text-xs font-medium relative z-10 ${isActive ? 'text-[#1E3A8A]' : 'text-[#6B7280]'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

