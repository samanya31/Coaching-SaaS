import { useEffect, useRef, useState } from 'react';
import { X, Loader } from 'lucide-react';
import { supabase } from '@/config/supabase';

interface ZoomPlayerProps {
    meetingNumber: string;
    password: string;
    userName: string;
    userEmail?: string;
    onClose: () => void;
}

export const ZoomPlayer = ({ meetingNumber, password, userName, userEmail = '', onClose }: ZoomPlayerProps) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<any>(null);
    const [status, setStatus] = useState<'loading' | 'joining' | 'joined' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        let mounted = true;

        const joinMeeting = async () => {
            try {
                setStatus('loading');

                // Dynamically import to avoid SSR / build issues
                const { ZoomMtgEmbedded } = await import('@zoom/meetingsdk/embedded');

                if (!mounted || !mountRef.current) return;

                const client = ZoomMtgEmbedded.createClient();
                clientRef.current = client;

                // Fetch signature from our Edge Function
                const { data: { session } } = await supabase.auth.getSession();
                const res = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoom-signature`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.access_token}`,
                        },
                        body: JSON.stringify({
                            meetingNumber,
                            role: 0, // 0 = attendee
                        }),
                    }
                );

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Failed to get Zoom signature');
                }

                const { signature, sdkKey } = await res.json();

                setStatus('joining');

                await client.init({
                    zoomAppRoot: mountRef.current,
                    language: 'en-US',
                    customize: {
                        video: {
                            isResizable: true,
                            viewSizes: { default: { width: 960, height: 540 } },
                        },
                    },
                });

                await client.join({
                    signature,
                    sdkKey,
                    meetingNumber,
                    password,
                    userName,
                    userEmail,
                });

                if (mounted) setStatus('joined');
            } catch (err: any) {
                console.error('Zoom join error:', err);
                if (mounted) {
                    setErrorMsg(err?.message || 'Failed to join meeting');
                    setStatus('error');
                }
            }
        };

        joinMeeting();

        return () => {
            mounted = false;
            if (clientRef.current) {
                try { clientRef.current.leaveMeeting(); } catch (_) { }
            }
        };
    }, [meetingNumber, password, userName, userEmail]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white flex-shrink-0">
                <span className="text-sm font-semibold">Live Class · Zoom</span>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Status overlays */}
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                    <Loader className="w-10 h-10 animate-spin mb-4 text-blue-400" />
                    <p className="text-lg font-medium">Connecting to Zoom...</p>
                    <p className="text-gray-400 text-sm mt-1">Please wait</p>
                </div>
            )}

            {status === 'joining' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                    <Loader className="w-10 h-10 animate-spin mb-4 text-green-400" />
                    <p className="text-lg font-medium">Joining meeting...</p>
                </div>
            )}

            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10 p-8 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-xl font-bold mb-2">Couldn't join meeting</p>
                    <p className="text-gray-400 mb-6">{errorMsg}</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100"
                    >
                        Go Back
                    </button>
                </div>
            )}

            {/* Zoom SDK mounts here */}
            <div ref={mountRef} className="flex-1 w-full" id="meetingSDKElement" />
        </div>
    );
};
