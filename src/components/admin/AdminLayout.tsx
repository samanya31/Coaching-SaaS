import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Video,
    FileText,
    IndianRupee,
    Megaphone,
    BarChart3,
    UserCog,
    Settings,
    Menu,
    X,
    LogOut,
    Bell,
    Search,
    Image,
    Radio,
    Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define sidebar items with role-based permissions
// Three roles: coaching_admin (full access), staff (students + instructors), teacher (batches + tests)
const allSidebarItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiredRoles: ['coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/students', icon: Users, label: 'Students', requiredRoles: ['staff', 'coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/batches', icon: GraduationCap, label: 'Batches', requiredRoles: ['teacher', 'coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/website', icon: Image, label: 'Website', requiredRoles: ['coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/tests', icon: FileText, label: 'Tests', requiredRoles: ['teacher', 'coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/payments', icon: IndianRupee, label: 'Finance', requiredRoles: ['coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/announcements', icon: Megaphone, label: 'Announcements', requiredRoles: ['teacher', 'coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/reports', icon: BarChart3, label: 'Reports', requiredRoles: ['coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/instructors', icon: UserCog, label: 'Instructors', requiredRoles: ['staff', 'coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/support-tickets', icon: Ticket, label: 'Support Tickets', requiredRoles: ['coaching_admin', 'super_admin'] },
    { path: '/admin/dashboard/settings', icon: Settings, label: 'Settings', requiredRoles: ['coaching_admin', 'super_admin'] }
];

export const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Get current user from localStorage
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const userRole = adminUser.role || 'teacher';

    // Filter sidebar items based on user role
    const sidebarItems = allSidebarItems.filter(item =>
        item.requiredRoles.includes(userRole)
    );

    const handleLogout = async () => {
        try {
            // 1. Clear Local Storage
            localStorage.removeItem('adminUser');

            // 2. Sign out from Supabase
            await import('@/config/supabase').then(mod => mod.supabase.auth.signOut());
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // 3. Redirect to login
            navigate('/admin/login');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 shadow-lg fixed left-0 top-0 bottom-0 z-30">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Admin Portal
                            </h1>
                            <p className="text-xs text-gray-500">Exam Edge</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-700' : ''}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
                        {/* Logo */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">E</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Admin
                                    </h1>
                                </div>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {sidebarItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className="lg:ml-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students, batches..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                                <Bell className="w-6 h-6 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Admin Profile */}
                            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">A</span>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-gray-900">Admin</p>
                                    <p className="text-xs text-gray-500">Super Admin</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
