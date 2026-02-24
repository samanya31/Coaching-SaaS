import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Users, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface YouTubeLivePlayerProps {
    videoId: string;
    title: string;
    isLive?: boolean;
    onClose?: () => void;
}

export const YouTubeLivePlayer: React.FC<YouTubeLivePlayerProps> = ({
    videoId,
    title,
    isLive = false,
    onClose
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Extract video ID from full YouTube URL if provided
    const getVideoId = (id: string): string => {
        // If it's already just an ID, return it
        if (!id.includes('youtube.com') && !id.includes('youtu.be')) {
            return id;
        }

        // Extract from full URL
        const urlMatch = id.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return urlMatch ? urlMatch[1] : id;
    };

    const embedUrl = `https://www.youtube.com/embed/${getVideoId(videoId)}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`;

    return (
        <div className="relative w-full h-full bg-black">
            {/* Top bar with back button */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex-1 mx-4">
                    <h2 className="font-semibold text-white text-sm line-clamp-1">{title}</h2>
                    {isLive && (
                        <div className="flex items-center gap-2 mt-1">
                            <motion.div
                                className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded-md"
                                animate={{ opacity: [1, 0.7, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Wifi className="w-3 h-3 text-white" />
                                <span className="text-xs font-semibold text-white">LIVE</span>
                            </motion.div>
                            <span className="text-xs text-white/70">Streaming now</span>
                        </div>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={onClose || (() => navigate(-1))}
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* YouTube iframe */}
            <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                title={title}
            />

            {/* Loading spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};
