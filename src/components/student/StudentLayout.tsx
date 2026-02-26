import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    BookOpen,
    Video,
    FileText,
    TrendingUp,
    Menu,
    FolderOpen,
    Settings,
    HelpCircle,
    LogOut,
    GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/app/providers/TenantProvider';
import { BottomNavigation } from './BottomNavigation';
import { MenuDrawer } from './MenuDrawer';
import { ExamGoalSelectorModal, ExamGoalButton } from '@/components/ExamGoalSelector';
import { useExamGoal } from '@/contexts/ExamGoalContext';
import defaultAvatar from '@/assets/student-avatar.png';

// Fallback logo asset - Removed missing NSDLOGO.png
// import nsdLogo from '@/assets/NSDLOGO.png';

const sidebarItems = [
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

export const StudentLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isLoading } = useAuth();
    const { coaching } = useTenant();
    const { selectedGoal, setSelectedGoal, availableGoals, isGoalSelectorOpen, openGoalSelector, closeGoalSelector } = useExamGoal();
    const [showMenu, setShowMenu] = useState(false);

    // Dynamic branding from admin settings
    const primaryColor = coaching?.primary_color || '#E25822';
    const logoUrl = coaching?.logo_url;
    const coachingName = coaching?.name || 'Exam Edge';

    // Protect Route
    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/student/login');
        }
    }, [user, isLoading, navigate]);

    // Sync context with local storage on mount if needed
    useEffect(() => {
        if (user?.phone) {
            const profileData = localStorage.getItem(`user_${user.phone}_profile`);
            if (profileData) {
                const { examGoal } = JSON.parse(profileData);
                if (examGoal) {
                    const goal = availableGoals.find(g => g.id === examGoal);
                    if (goal) setSelectedGoal(goal);
                }
            }
        }
    }, [user, availableGoals, setSelectedGoal]);

    const handleGoalSelect = (goalId: string) => {
        const goal = availableGoals.find(g => g.id === goalId);
        if (goal) {
            setSelectedGoal(goal);
            // Update local storage
            if (user?.phone) {
                const profileData = localStorage.getItem(`user_${user.phone}_profile`);
                const currentProfile = profileData ? JSON.parse(profileData) : {};
                localStorage.setItem(`user_${user.phone}_profile`, JSON.stringify({
                    ...currentProfile,
                    examGoal: goalId
                }));
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/student/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Fixed Header */}
            <header className="h-20 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-8 shadow-sm">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMenu(true)}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Dynamic Coaching Logo & Name */}
                    <Link to="/student/dashboard" className="flex items-center gap-3">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={coachingName}
                                className="h-12 w-auto object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-xl">{coachingName.charAt(0)}</span>
                            </div>
                        )}
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold leading-none uppercase tracking-wide" style={{ color: primaryColor }}>{coachingName}</h1>
                            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1">Student Portal</p>
                        </div>
                    </Link>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 md:gap-8">
                    {/* Goal Selector */}
                    <div className="block">
                        <ExamGoalButton
                            currentGoal={selectedGoal.name}
                            icon={selectedGoal.icon}
                            onClick={openGoalSelector}
                        />
                    </div>

                    {/* User Profile + Logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'Student'}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">ID: {user?.id?.split('-')[0].toUpperCase() || 'STU-001'}</p>
                        </div>

                        {/* Avatar circle */}
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 bg-slate-100">
                            <img
                                src={user?.avatar_url || defaultAvatar}
                                alt={user?.name || 'Student'}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Layout Body */}
            <div className="flex pt-20 min-h-screen">
                {/* Desktop Sidebar (Left) */}
                <aside className="hidden lg:flex flex-col w-72 bg-white fixed left-0 top-20 bottom-0 z-40">
                    <div className="flex-1 overflow-y-auto p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-4">Navigation</p>
                        <nav className="space-y-2">
                            {sidebarItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-r-full transition-all font-medium text-[15px] border-l-4 ${isActive
                                            ? 'border-current'
                                            : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        style={isActive ? {
                                            backgroundColor: primaryColor + '18',
                                            color: primaryColor,
                                            borderColor: primaryColor
                                        } : {}}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Logout Button pinned at bottom */}
                    <div className="px-6 pb-6">
                        <div className="border-t border-slate-100 pt-4">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 w-full px-4 py-3.5 rounded-r-full transition-all font-medium text-[15px] border-l-4 border-transparent text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 group"
                            >
                                <LogOut className="w-5 h-5 stroke-[1.5] group-hover:stroke-2" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content (Right) */}
                <main className="flex-1 lg:ml-72 bg-slate-50 min-h-[calc(100vh-5rem)] px-2 sm:px-4 md:px-6 py-4 md:py-6 pb-24 lg:pb-6">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Components */}
            <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} />
            <div className="lg:hidden">
                <BottomNavigation />
            </div>

            <ExamGoalSelectorModal
                isOpen={isGoalSelectorOpen}
                onClose={closeGoalSelector}
                onSelect={handleGoalSelect}
                currentGoal={selectedGoal.id}
            />
        </div>
    );
};
