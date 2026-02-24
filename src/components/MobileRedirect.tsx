import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/contexts/AuthContext';

export const MobileRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // Only redirect if we're on mobile and at the root path
        if (Capacitor.isNativePlatform() && location.pathname === '/') {
            if (isAuthenticated) {
                // User is logged in - go to dashboard
                navigate('/student/dashboard', { replace: true });
            } else {
                // User is not logged in - go to login
                navigate('/student/login', { replace: true });
            }
        }
    }, [navigate, location, isAuthenticated]);

    return null;
};
