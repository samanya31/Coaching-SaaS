import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export const PWAInstallPrompt = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const isStudentPortal = location.pathname.startsWith('/student/');

    useEffect(() => {
        // Only show install prompt in student portal when logged in
        if (!isStudentPortal || !isAuthenticated) return;

        let deferredPrompt: any;

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show install button/banner only for students
            const showInstallPrompt = () => {
                if (deferredPrompt && isStudentPortal) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult: any) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        }
                        deferredPrompt = null;
                    });
                }
            };

            // Auto-show after 10 seconds on student portal
            setTimeout(showInstallPrompt, 10000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [isStudentPortal, isAuthenticated]);

    return null; // This is a logic-only component
};
