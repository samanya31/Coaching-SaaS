import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const VideoPlayerPage = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { videoUrl, classTitle, batchTitle } = location.state || {};

    // If no video URL is provided in state, we should ideally fetch it using the id
    // However, based on the current navigation logic, it's always passed via state.
    // We'll add a simple fallback/redirect if it's missing.

    if (!videoUrl) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white text-center">
                <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
                <p className="text-gray-400 mb-6">The video link is missing or has expired.</p>
                <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
            <VideoPlayer
                url={videoUrl}
                title={classTitle || 'Video Lecture'}
            />
        </div>
    );
};
