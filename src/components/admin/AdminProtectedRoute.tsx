import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/config/supabase';

export const AdminProtectedRoute = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const verifyAdmin = async () => {
            const storedUser = localStorage.getItem('adminUser');

            if (!storedUser) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            try {
                const adminUser = JSON.parse(storedUser);

                // Basic role check from localStorage
                if (!adminUser?.id || !adminUser?.role ||
                    !['coaching_admin', 'super_admin', 'teacher', 'staff'].includes(adminUser.role)) {
                    localStorage.removeItem('adminUser');
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }

                // Cross-check with current Supabase session to avoid mismatched JWT/localStorage
                const { data: { user } } = await supabase.auth.getUser();

                if (!user || user.id !== adminUser.id) {
                    // Session belongs to someone else (e.g., a student/teacher) – force re-login.
                    localStorage.removeItem('adminUser');
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            } catch {
                localStorage.removeItem('adminUser');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAdmin();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};
