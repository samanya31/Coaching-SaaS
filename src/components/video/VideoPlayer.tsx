import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward,
    ArrowLeft,
    Settings,
    MoreVertical,
    Maximize2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

interface VideoPlayerProps {
    url: string;
    title: string;
    poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, poster }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showCenterControls, setShowCenterControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();
    const centerControlsTimeoutRef = useRef<NodeJS.Timeout>();
    const navigate = useNavigate();

    // Helper function to check if URL is from Google Drive
    const isGoogleDriveUrl = (url: string): boolean => {
        return url.includes('drive.google.com');
    };

    // Helper function to convert Google Drive URL to embed URL
    const getGoogleDriveEmbedUrl = (url: string): string => {
        const fileIdMatch = url.match(/\/d\/([^/]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
            return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
        }
        return url;
    };

    // Helper function to check if URL is from YouTube
    const isYouTubeUrl = (url: string): boolean => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // Helper function to extract YouTube Video ID
    const getYouTubeId = (url: string): string => {
        const urlMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return urlMatch ? urlMatch[1] : '';
    };

    // Helper function to get YouTube embed URL
    const getYouTubeEmbedUrl = (url: string): string => {
        const id = getYouTubeId(url);
        return `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`;
    };

    // Helper function to check if URL is from Vimeo
    const isVimeoUrl = (url: string): boolean => {
        return url.includes('vimeo.com');
    };

    // Helper function to extract Vimeo Video ID
    const getVimeoId = (url: string): string => {
        const urlMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        return urlMatch ? urlMatch[1] : '';
    };

    // Helper function to get Vimeo embed URL
    const getVimeoEmbedUrl = (url: string): string => {
        const id = getVimeoId(url);
        return `https://player.vimeo.com/video/${id}?autoplay=1`;
    };

    // Handle Fullscreen & StatusBar
    const enterFullscreen = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await StatusBar.hide();
                if (Capacitor.getPlatform() === 'android') {
                    await StatusBar.setOverlaysWebView({ overlay: true });
                }
            } catch (e) {
                console.error('Error hiding status bar:', e);
            }
        }

        if (containerRef.current && !document.fullscreenElement) {
            try {
                const element = containerRef.current as any;
                if (element.requestFullscreen) {
                    await element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) {
                    await element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) {
                    await element.msRequestFullscreen();
                }
            } catch (e) {
                console.error('Error requesting fullscreen:', e);
            }
        }
    };

    const exitFullscreen = async () => {
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(console.error);
        }
    };

    // Initial fullscreen attempt on mount
    useEffect(() => {
        enterFullscreen();
        return () => { exitFullscreen(); };
    }, []);

    // Speed change handler
    const handleSpeedChange = (speed: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.playbackRate = speed;
        setPlaybackSpeed(speed);
        setShowSettingsMenu(false);
    };

    // Initialize HLS or regular video
    useEffect(() => {
        const video = videoRef.current;
        if (!video || isGoogleDriveUrl(url) || isYouTubeUrl(url) || isVimeoUrl(url)) return;

        if (Hls.isSupported() && url.includes('.m3u8')) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsLoading(false);
            });
            return () => hls.destroy();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
            });
        } else {
            video.src = url;
            video.load();
            video.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
            });
            setIsLoading(false);
        }
    }, [url]);

    // Video event listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, []);

    // Auto-hide center controls after 4 seconds
    useEffect(() => {
        if (isPlaying && showCenterControls) {
            if (centerControlsTimeoutRef.current) {
                clearTimeout(centerControlsTimeoutRef.current);
            }
            centerControlsTimeoutRef.current = setTimeout(() => {
                setShowCenterControls(false);
            }, 4000);
        }
        return () => {
            if (centerControlsTimeoutRef.current) clearTimeout(centerControlsTimeoutRef.current);
        };
    }, [isPlaying, showCenterControls]);

    const handleUserInteraction = () => {
        setShowControls(true);

        if (!isFullscreen && Capacitor.isNativePlatform()) {
            enterFullscreen();
        }

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        if (isPlaying && !showMoreMenu && !showSettingsMenu) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    // Trigger initial auto-hide when playing starts
    useEffect(() => {
        if (isPlaying && !showMoreMenu && !showSettingsMenu) {
            if (!isFullscreen) enterFullscreen();

            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying, showMoreMenu, showSettingsMenu]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (!isPlaying && !isFullscreen) {
            enterFullscreen();
        }

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (Capacitor.isNativePlatform()) {
                try {
                    await ScreenOrientation.lock({ orientation: 'landscape' });
                } catch (e) {
                    console.error('Error locking to landscape:', e);
                }
            }

            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (Capacitor.isNativePlatform()) {
                try {
                    await ScreenOrientation.unlock();
                } catch (e) {
                    console.error('Error unlocking orientation:', e);
                }
            }

            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    const handleSeek = (value: number[]) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = value[0];
        setCurrentTime(value[0]);
    };

    const handleVolumeChange = (value: number[]) => {
        const video = videoRef.current;
        if (!video) return;
        video.volume = value[0];
        setVolume(value[0]);
        setIsMuted(value[0] === 0);
    };

    const skip = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime += seconds;
    };

    const watchFromBeginning = () => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;
        video.play();
        setShowSettingsMenu(false);
    };

    const formatTime = (time: number) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const secs = Math.floor(time % 60);
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full bg-black ${isFullscreen ? 'fixed inset-0 z-[100]' : ''}`}
            onMouseMove={handleUserInteraction}
            onTouchStart={handleUserInteraction}
            onClick={handleUserInteraction}
        >
            {isGoogleDriveUrl(url) ? (
                <iframe
                    src={getGoogleDriveEmbedUrl(url)}
                    className="w-full h-full"
                    allow="autoplay"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                />
            ) : isYouTubeUrl(url) ? (
                <iframe
                    src={getYouTubeEmbedUrl(url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                    title={title}
                />
            ) : isVimeoUrl(url) ? (
                <iframe
                    src={getVimeoEmbedUrl(url)}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                    title={title}
                />
            ) : (
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    poster={poster}
                    playsInline
                    onClick={togglePlay}
                />
            )}

            {/* Loading spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Center Controls Overlay */}
            <AnimatePresence>
                {showCenterControls && !isLoading && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center gap-12 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <button
                            className="w-14 h-14 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm pointer-events-auto hover:bg-black/80 transition-colors"
                            onClick={() => skip(-10)}
                        >
                            <SkipBack className="w-7 h-7 text-white" />
                        </button>

                        <button
                            className="w-16 h-16 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm pointer-events-auto hover:bg-black/80 transition-colors"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <Pause className="w-8 h-8 text-white" />
                            ) : (
                                <Play className="w-8 h-8 text-white ml-1" />
                            )}
                        </button>

                        <button
                            className="w-14 h-14 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm pointer-events-auto hover:bg-black/80 transition-colors"
                            onClick={() => skip(10)}
                        >
                            <SkipForward className="w-7 h-7 text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls overlay */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        className="absolute inset-0 flex flex-col justify-between pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Top bar */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </Button>

                            <h2 className="flex-1 mx-4 font-semibold text-white text-sm line-clamp-2">{title}</h2>

                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={() => {
                                        setShowSettingsMenu(!showSettingsMenu);
                                        setShowMoreMenu(false);
                                    }}
                                >
                                    <Settings className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={() => {
                                        setShowMoreMenu(!showMoreMenu);
                                        setShowSettingsMenu(false);
                                    }}
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Settings Menu - Playback Speed */}
                        <AnimatePresence>
                            {showSettingsMenu && (
                                <motion.div
                                    className="absolute top-16 right-16 pointer-events-auto"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="bg-black/90 rounded-lg p-4 min-w-[200px] backdrop-blur-sm border border-white/10">
                                        <h3 className="text-white font-semibold mb-3 px-2 border-b border-white/10 pb-2">Playback Speed</h3>
                                        <div className="space-y-1">
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                                <button
                                                    key={speed}
                                                    className={`flex items-center justify-between w-full py-2 px-2 rounded transition-colors ${playbackSpeed === speed
                                                        ? 'bg-white/20 text-white'
                                                        : 'text-white/80 hover:bg-white/10'
                                                        }`}
                                                    onClick={() => handleSpeedChange(speed)}
                                                >
                                                    <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                                                    {playbackSpeed === speed && (
                                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* More Menu */}
                        <AnimatePresence>
                            {showMoreMenu && (
                                <motion.div
                                    className="absolute top-16 right-4 pointer-events-auto"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="bg-black/90 rounded-lg p-4 min-w-[200px] backdrop-blur-sm">
                                        <button
                                            className="flex items-center gap-3 text-white hover:text-primary transition-colors w-full py-2"
                                            onClick={() => {
                                                toggleFullscreen();
                                                setShowMoreMenu(false);
                                            }}
                                        >
                                            <Maximize2 className="w-5 h-5" />
                                            <span>Zoom</span>
                                        </button>
                                        <button
                                            className="flex items-center gap-3 text-white hover:text-primary transition-colors w-full py-2"
                                            onClick={watchFromBeginning}
                                        >
                                            <Play className="w-5 h-5" />
                                            <span>Watch from beginning</span>
                                        </button>
                                        <button
                                            className="flex items-center gap-3 text-white hover:text-primary transition-colors w-full py-2"
                                            onClick={() => navigate(-1)}
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                            <span>Exit playing</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bottom controls */}
                        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent space-y-3 pointer-events-auto">
                            {/* Progress bar */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-white/90 font-medium min-w-[45px]">{formatTime(currentTime)}</span>
                                <Slider
                                    value={[currentTime]}
                                    max={duration || 100}
                                    step={1}
                                    onValueChange={handleSeek}
                                    className="flex-1"
                                />
                                <span className="text-xs text-white/90 font-medium min-w-[45px] text-right">{formatTime(duration)}</span>
                            </div>

                            {/* Control buttons */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={toggleMute}
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-5 h-5" />
                                    ) : (
                                        <Volume2 className="w-5 h-5" />
                                    )}
                                </Button>

                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={() => skip(-10)}
                                    >
                                        <SkipBack className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={togglePlay}
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-6 h-6" />
                                        ) : (
                                            <Play className="w-6 h-6" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={() => skip(10)}
                                    >
                                        <SkipForward className="w-5 h-5" />
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={toggleFullscreen}
                                >
                                    {isFullscreen ? (
                                        <Minimize className="w-5 h-5" />
                                    ) : (
                                        <Maximize className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
