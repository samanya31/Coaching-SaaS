import { X } from 'lucide-react';

interface YouTubePlayerProps {
    videoId: string;
    title?: string;
    onClose: () => void;
    /** If true, treats as a live stream (autoplay + no controls for seeking past live edge) */
    isLive?: boolean;
}

/** Extract YouTube video ID from a full URL or return as-is if already an ID */
export function extractYouTubeId(urlOrId: string): string {
    try {
        const url = new URL(urlOrId);
        // youtu.be/VIDEO_ID
        if (url.hostname === 'youtu.be') return url.pathname.slice(1);
        // youtube.com/watch?v=VIDEO_ID
        const v = url.searchParams.get('v');
        if (v) return v;
        // youtube.com/live/VIDEO_ID
        const parts = url.pathname.split('/');
        const liveIdx = parts.indexOf('live');
        if (liveIdx !== -1 && parts[liveIdx + 1]) return parts[liveIdx + 1];
    } catch {
        // Not a URL — treat as raw ID
    }
    return urlOrId.trim();
}

export const YouTubePlayer = ({ videoId, title, onClose, isLive }: YouTubePlayerProps) => {
    const cleanId = extractYouTubeId(videoId);
    const embedUrl = `https://www.youtube.com/embed/${cleanId}?autoplay=1&rel=0${isLive ? '&live=1' : ''}`;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-semibold">{title || 'Live Class'} · YouTube</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* YouTube embed */}
            <div className="flex-1 w-full">
                <iframe
                    src={embedUrl}
                    title={title || 'Live Class'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>
        </div>
    );
};
