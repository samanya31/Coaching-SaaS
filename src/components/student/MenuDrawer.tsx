import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, HelpCircle, LogOut, FolderOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const menuItems = [
    { path: '/student/dashboard/batches', icon: GraduationCap, label: 'My Batches' },
    { path: '/student/dashboard/materials', icon: FolderOpen, label: 'Study Materials' },
    { path: '/student/dashboard/profile', icon: User, label: 'Profile' },
    { path: '/student/dashboard/settings', icon: Settings, label: 'Settings' },
    { path: '/student/dashboard/help', icon: HelpCircle, label: 'Help & Support' }
];

interface MenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MenuDrawer = ({ isOpen, onClose }: MenuDrawerProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

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
                        <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-600 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                                        <span className="text-white text-2xl font-bold">
                                            {user?.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <h3 className="text-white font-semibold text-lg">{user?.name || 'Student'}</h3>
                                    <p className="text-blue-100 text-sm">{user?.email}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-white hover:bg-white/20"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="p-4 space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === item.path
                                        ? 'bg-blue-50 text-[#1E3A8A]'
                                        : 'text-[#6B7280] hover:bg-slate-50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}

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
