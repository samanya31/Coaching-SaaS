import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminProtectedRoute = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // localStorage-only check — fast and no DB dependency.
        // The admin user is written on successful login and cleared on logout.
        // Role was verified at login time against the DB.
        const storedUser = localStorage.getItem('adminUser');

        if (!storedUser) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {
            const adminUser = JSON.parse(storedUser);

            if (!adminUser?.id || !adminUser?.role) {
                localStorage.removeItem('adminUser');
                setIsAuthenticated(false);
            } else if (!['coaching_admin', 'super_admin', 'teacher', 'staff'].includes(adminUser.role)) {
                localStorage.removeItem('adminUser');
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
        } catch {
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
        }

        setIsLoading(false);
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
