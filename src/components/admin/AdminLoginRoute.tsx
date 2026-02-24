import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protects admin login route - redirects to dashboard if already logged in
 */
export const AdminLoginRoute = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if admin is already logged in
        const storedUser = localStorage.getItem('adminUser');

        if (!storedUser) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {
            const adminUser = JSON.parse(storedUser);

            if (adminUser?.id && adminUser?.role && 
                ['coaching_admin', 'super_admin', 'teacher', 'staff'].includes(adminUser.role)) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch {
            setIsAuthenticated(false);
        }

        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Otherwise, show login page
    return <>{children}</>;
};
