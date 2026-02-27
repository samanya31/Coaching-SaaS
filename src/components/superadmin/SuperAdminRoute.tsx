import { Navigate, Outlet } from 'react-router-dom';
import { useSuperAdminAuth } from '@/contexts/SuperAdminAuthContext';

export const SuperAdminRoute = () => {
    const { isAuthenticated, isLoading } = useSuperAdminAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/superadmin/login" replace />;
    }

    return <Outlet />;
};
