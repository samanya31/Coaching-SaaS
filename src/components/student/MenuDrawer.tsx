import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, HelpCircle, LogOut, FolderOpen, GraduationCap, Home, BookOpen, Video, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/app/providers/TenantProvider';
import { Button } from '@/components/ui/button';
import defaultAvatar from '@/assets/student-avatar.png';

const menuItems = [
    { path: '/student/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/student/dashboard/batches', icon: GraduationCap, label: 'Batches' },
    { path: '/student/dashboard/courses', icon: BookOpen, label: 'My Courses' },
    { path: '/student/dashboard/live-classes', icon: Video, label: 'Live Classes' },
    { path: '/student/dashboard/tests', icon: FileText, label: 'Tests' },
    { path: '/student/dashboard/performance', icon: TrendingUp, label: 'Performance' },
    { path: '/student/dashboard/materials', icon: FolderOpen, label: 'Current Affairs' },
    { path: '/student/dashboard/profile', icon: Settings, label: 'Settings' },
    { path: '/student/dashboard/help', icon: HelpCircle, label: 'Help & Support' },
];

interface MenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MenuDrawer = ({ isOpen, onClose }: MenuDrawerProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { coaching } = useTenant();
    const primaryColor = coaching?.primary_color || '#E25822';

    const handleLogout = () => {
        logout();
        navigate('/student/login');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-2xl overflow-y-auto"
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Drawer Header */}
                        <div className="bg-white p-6 border-b border-slate-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="w-16 h-16 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center mb-3">
                                        <img
                                            src={user?.avatar_url || defaultAvatar}
                                            alt={user?.name || 'Student'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="text-slate-900 font-semibold text-lg">{user?.name || 'Student'}</h3>
                                    <p className="text-slate-500 text-sm">{user?.email}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-slate-400 hover:bg-slate-100"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="p-4 space-y-2">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium border-l-4 ${isActive
                                            ? 'border-current'
                                            : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        style={isActive ? {
                                            backgroundColor: primaryColor + '18',
                                            color: primaryColor,
                                            borderColor: primaryColor
                                        } : {}}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}

                            <div className="border-t border-slate-200 my-4" />

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
