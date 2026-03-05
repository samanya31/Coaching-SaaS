import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';
import { Save, Video, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const ZoomSettings = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [zoomData, setZoomData] = useState({ zoom_sdk_key: '', zoom_sdk_secret: '' });

    const isConfigured = !!(zoomData.zoom_sdk_key && zoomData.zoom_sdk_secret);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from('platform_settings')
                .select('settings')
                .eq('id', 'global')
                .single();
            if (data?.settings?.zoom_sdk_key) {
                setZoomData({
                    zoom_sdk_key: data.settings.zoom_sdk_key || '',
                    zoom_sdk_secret: data.settings.zoom_sdk_secret || '',
                });
            }
            setIsLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: existing } = await supabase
                .from('platform_settings')
                .select('settings')
                .eq('id', 'global')
                .single();

            const newSettings = {
                ...(existing?.settings || {}),
                zoom_sdk_key: zoomData.zoom_sdk_key.trim(),
                zoom_sdk_secret: zoomData.zoom_sdk_secret.trim(),
            };

            const { error } = await supabase
                .from('platform_settings')
                .upsert({ id: 'global', settings: newSettings });

            if (error) throw error;
            toast.success('Zoom SDK credentials saved for all coaching institutes!');
        } catch (err) {
            toast.error('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = async () => {
        if (!confirm('Remove Zoom SDK credentials? All coaching institutes will lose Zoom embedding.')) return;
        setIsSaving(true);
        try {
            const { data: existing } = await supabase
                .from('platform_settings')
                .select('settings')
                .eq('id', 'global')
                .single();

            const newSettings = { ...(existing?.settings || {}) };
            delete newSettings.zoom_sdk_key;
            delete newSettings.zoom_sdk_secret;

            await supabase
                .from('platform_settings')
                .upsert({ id: 'global', settings: newSettings });

            setZoomData({ zoom_sdk_key: '', zoom_sdk_secret: '' });
            toast.success('Zoom integration removed.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-gray-400">Loading...</div>;

    return (
        <div className="p-6 space-y-6 max-w-2xl">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Zoom Meeting SDK</h2>
                <p className="text-sm text-gray-500 mt-1">
                    One set of credentials works for <strong>all coaching institutes</strong> on this platform.
                    Students can join Zoom classes embedded directly inside the app.
                </p>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-3">
                {isConfigured ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                        <CheckCircle className="w-4 h-4" /> Active — all coachings can use Zoom
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                        <AlertCircle className="w-4 h-4" /> Not configured — Zoom disabled for all coachings
                    </span>
                )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">How to get SDK credentials:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-600">
                    <li>Go to <a href="https://marketplace.zoom.us" target="_blank" rel="noreferrer" className="underline font-medium">marketplace.zoom.us</a></li>
                    <li>Build App → <strong>Meeting SDK</strong> (it's free)</li>
                    <li>Copy your <strong>SDK Key</strong> and <strong>SDK Secret</strong></li>
                </ol>
            </div>

            {/* SDK Key */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SDK Key</label>
                <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        value={zoomData.zoom_sdk_key}
                        onChange={e => setZoomData(p => ({ ...p, zoom_sdk_key: e.target.value }))}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                </div>
            </div>

            {/* SDK Secret */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SDK Secret</label>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex-shrink-0" />
                    <div className="relative flex-1">
                        <input
                            type={showSecret ? 'text' : 'password'}
                            value={zoomData.zoom_sdk_secret}
                            onChange={e => setZoomData(p => ({ ...p, zoom_sdk_secret: e.target.value }))}
                            className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            placeholder="••••••••••••••••••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !zoomData.zoom_sdk_key || !zoomData.zoom_sdk_secret}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Credentials'}
                </button>
                {isConfigured && (
                    <button
                        onClick={handleClear}
                        disabled={isSaving}
                        className="px-5 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                        Disconnect
                    </button>
                )}
            </div>
        </div>
    );
};
