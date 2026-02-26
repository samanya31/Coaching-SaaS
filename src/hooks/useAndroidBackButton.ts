import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

// Root / home paths where pressing back should exit the app
const EXIT_PATHS = ['/student/login', '/student/dashboard', '/admin/login', '/admin/dashboard'];

export const useAndroidBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Only run on native Android
        if (!Capacitor.isNativePlatform()) return;

        const handler = App.addListener('backButton', () => {
            const isExitPath = EXIT_PATHS.some(p => location.pathname === p);

            if (isExitPath) {
                // On root screens, exit the app
                App.exitApp();
            } else {
                // Otherwise navigate back
                navigate(-1);
            }
        });

        return () => {
            handler.then(h => h.remove());
        };
    }, [location.pathname, navigate]);
};
