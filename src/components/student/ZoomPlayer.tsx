import { useEffect, useRef, useState } from 'react';
import { X, Loader, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '@/config/supabase';

interface ZoomPlayerProps {
    meetingNumber: string;
    password?: string;
    userName: string;
    userEmail?: string;
    onClose: () => void;
}

export const ZoomPlayer = ({
    meetingNumber,
    password = '',
    userName,
    userEmail = '',
    onClose
}: ZoomPlayerProps) => {

    const mountRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<any>(null);
    const initLock = useRef(false);

    const [status, setStatus] = useState<'loading' | 'joining' | 'joined' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (initLock.current) return;
        initLock.current = true;

        let mounted = true;

        const startMeeting = async () => {
            try {
                setStatus('loading');

                if (!meetingNumber?.trim()) {
                    throw new Error('Invalid meeting ID');
                }

                // ⭐ Small delay prevents GPU/WebGL race conditions
                await new Promise(res => setTimeout(res, 400));

                // Load Zoom SDK
                const zoomModule = await import('@zoom/meetingsdk/embedded');
                const ZoomMtgEmbedded = zoomModule.ZoomMtgEmbedded ?? (zoomModule as any).default;
                if (!ZoomMtgEmbedded) throw new Error('Failed to load Zoom SDK');

                if (!mounted || !mountRef.current) return;

                // Fetch auth token
                const { data: { session } } = await supabase.auth.getSession();
                const bearerToken = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

                // Fetch signature
                const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoom-signature`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bearerToken}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({
                        meetingNumber: meetingNumber.trim(),
                        role: 0,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || 'Failed to get Zoom signature');

                const { signature, sdkKey } = data;
                if (!signature) throw new Error('Missing Zoom signature');
                if (!sdkKey) throw new Error('Missing Zoom SDK key');

                // Create client
                const client = ZoomMtgEmbedded.createClient();
                clientRef.current = client;

                setStatus('joining');

                // ⭐ Ultra-stable init
                await client.init({
                    zoomAppRoot: mountRef.current,
                    language: 'en-US',
                    patchJsMedia: true, // ⭐ prevents black screens
                    customize: {
                        audio: {
                            audioPanelAlwaysOpen: true,
                        }
                    }
                });

                // Join meeting
                await client.join({
                    signature,
                    meetingNumber: meetingNumber.trim(),
                    password,
                    userName: userName || 'Student',
                    userEmail,
                });

                if (mounted) setStatus('joined');

            } catch (err: any) {
                console.error('Zoom Error:', err);
                if (mounted) {
                    setErrorMsg(err?.message || err?.reason || 'Failed to join meeting');
                    setStatus('error');
                }
            }
        };

        startMeeting();

        return () => {
            mounted = false;

            if (clientRef.current) {
                try {
                    clientRef.current.leaveMeeting();
                    clientRef.current.destroyClient();
                } catch { }
                clientRef.current = null;
            }

            if (mountRef.current) mountRef.current.innerHTML = '';

            initLock.current = false;
        };
    }, [meetingNumber, password, userName, userEmail]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">

            {/* Header */}
            <div className="relative z-[110] flex items-center justify-between px-4 bg-gray-900 text-white" style={{ height: 48 }}>
                <span className="text-sm font-semibold">Live Class · Zoom</span>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Loading */}
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                    <Loader className="w-10 h-10 animate-spin mb-4 text-blue-400" />
                    <p className="text-lg font-medium">Connecting to Zoom...</p>
                </div>
            )}

            {/* Joining */}
            {status === 'joining' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                    <Loader className="w-10 h-10 animate-spin mb-4 text-green-400" />
                    <p className="text-lg font-medium">Joining meeting...</p>
                </div>
            )}

            {/* Error */}
            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10 p-8 text-center">
                    <AlertTriangle className="w-14 h-14 text-yellow-400 mb-4" />
                    <p className="text-xl font-bold mb-3">Couldn't join meeting</p>
                    <p className="text-gray-300 mb-6 text-sm max-w-md">{errorMsg}</p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20"
                        >
                            Go Back
                        </button>

                        <a
                            href={`https://zoom.us/j/${meetingNumber.replace(/\s/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2 justify-center"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open in Zoom App
                        </a>
                    </div>
                </div>
            )}

            {/* Zoom Mount */}
            <div
                ref={mountRef}
                id="meetingSDKElement"
                style={{
                    width: '100%',
                    height: 'calc(100dvh - 48px)',
                    backgroundColor: '#000',
                    overflow: 'hidden'
                }}
            />
        </div>
    );
};