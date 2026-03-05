import { useState } from 'react';
import { ASSETS } from '@/config/assets';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    HardDrive,
    Settings,
    Menu,
    X,
    LogOut,
    Shield,
    ChevronRight,
    Crown,
} from 'lucide-react';
import { useSuperAdminAuth } from '@/contexts/SuperAdminAuthContext';

const navItems = [
    { path: '/superadmin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/superadmin/dashboard/institutes', icon: Building2, label: 'Institutes' },
    { path: '/superadmin/dashboard/plans', icon: Crown, label: 'Plans' },
    { path: '/superadmin/dashboard/billing', icon: CreditCard, label: 'Billing' },
    { path: '/superadmin/dashboard/storage', icon: HardDrive, label: 'Storage' },
    { path: '/superadmin/dashboard/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { superAdmin, logout } = useSuperAdminAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/superadmin/login');
    };

    return (
        <div className="flex flex-col h-full bg-[#0F172A] text-white w-64">
            {/* Logo */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={ASSETS.appLogo} alt="Vidya Yantra Logo" className="w-9 h-9 object-contain drop-shadow-lg" />
                    <div>
                        <p className="font-bold text-white text-sm leading-tight">Vidya Yantra</p>
                        <div className="flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5 text-indigo-400" />
                            <span className="text-indigo-400 text-[10px] font-semibold uppercase tracking-widest">Super Admin</span>
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-slate-400 hover:text-white lg:hidden">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            onClick={onClose}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${isActive
                                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`} />
                                <span className="text-sm font-medium">{label}</span>
                            </div>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {superAdmin?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{superAdmin?.name || 'Super Admin'}</p>
                        <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wide">Platform Owner</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export const SuperAdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 shadow-2xl">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 shadow-2xl">
                        <Sidebar onClose={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200 h-14 flex items-center px-4 lg:px-6 gap-4">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
                    >
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-semibold text-gray-700">Super Admin Console</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
