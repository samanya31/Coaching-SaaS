import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protects student login route - redirects to dashboard if already logged in
 */
export const StudentLoginRoute = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if student is already logged in
        const storedUser = localStorage.getItem('studentUser');

        if (!storedUser) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {
            const studentUser = JSON.parse(storedUser);

            if (studentUser?.id && studentUser?.email) {
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
                    <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/student/dashboard" replace />;
    }

    // Otherwise, show login page
    return <>{children}</>;
};
