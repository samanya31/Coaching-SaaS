import { useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useTenant } from '@/app/providers/TenantProvider';
import { toast } from 'sonner';
import { Save, Video, Youtube, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const IntegrationsSettings = () => {
    const { coachingId } = useTenant();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSecret, setShowSecret] = useState(false);

    const [zoomData, setZoomData] = useState({
        zoom_sdk_key: '',
        zoom_sdk_secret: '',
    });

    const isZoomConfigured = !!(zoomData.zoom_sdk_key && zoomData.zoom_sdk_secret);

    useEffect(() => {
        const load = async () => {
            if (!coachingId) return;
            const { data } = await supabase
                .from('coachings')
                .select('settings')
                .eq('id', coachingId)
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
    }, [coachingId]);

    const handleSaveZoom = async () => {
        if (!coachingId) return;
        setIsSaving(true);
        try {
            // First get existing settings
            const { data: existing } = await supabase
                .from('coachings')
                .select('settings')
                .eq('id', coachingId)
                .single();

            const newSettings = {
                ...(existing?.settings || {}),
                zoom_sdk_key: zoomData.zoom_sdk_key.trim(),
                zoom_sdk_secret: zoomData.zoom_sdk_secret.trim(),
            };

            const { error } = await supabase
                .from('coachings')
                .update({ settings: newSettings })
                .eq('id', coachingId);

            if (error) throw error;
            toast.success('Zoom credentials saved!');
        } catch (err) {
            toast.error('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearZoom = async () => {
        if (!coachingId || !confirm('Remove Zoom integration?')) return;
        setIsSaving(true);
        try {
            const { data: existing } = await supabase
                .from('coachings')
                .select('settings')
                .eq('id', coachingId)
                .single();

            const newSettings = { ...(existing?.settings || {}) };
            delete newSettings.zoom_sdk_key;
            delete newSettings.zoom_sdk_secret;

            await supabase.from('coachings').update({ settings: newSettings }).eq('id', coachingId);
            setZoomData({ zoom_sdk_key: '', zoom_sdk_secret: '' });
            toast.success('Zoom integration removed.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-gray-400">Loading...</div>;

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
                <p className="text-gray-500 mt-1">Connect third-party services to power your live classes.</p>
            </div>

            {/* Zoom */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Video className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Zoom Meeting SDK</h3>
                                <p className="text-sm text-gray-500">Embed Zoom live classes inside your app</p>
                            </div>
                        </div>
                        {isZoomConfigured ? (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                                <CheckCircle className="w-4 h-4" /> Connected
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                                <AlertCircle className="w-4 h-4" /> Not configured
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                        <p className="font-semibold mb-1">How to get your SDK credentials:</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-600">
                            <li>Go to <a href="https://marketplace.zoom.us" target="_blank" rel="noreferrer" className="underline font-medium">marketplace.zoom.us</a></li>
                            <li>Build App → Meeting SDK</li>
                            <li>Copy your <strong>SDK Key</strong> and <strong>SDK Secret</strong></li>
                        </ol>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">SDK Key</label>
                        <input
                            type="text"
                            value={zoomData.zoom_sdk_key}
                            onChange={e => setZoomData(p => ({ ...p, zoom_sdk_key: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">SDK Secret</label>
                        <div className="relative">
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

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSaveZoom}
                            disabled={isSaving || !zoomData.zoom_sdk_key || !zoomData.zoom_sdk_secret}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Credentials'}
                        </button>
                        {isZoomConfigured && (
                            <button
                                onClick={handleClearZoom}
                                disabled={isSaving}
                                className="px-5 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* YouTube */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                                <Youtube className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">YouTube Live / Unlisted</h3>
                                <p className="text-sm text-gray-500">Embed YouTube live streams or unlisted videos</p>
                            </div>
                        </div>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                            <CheckCircle className="w-4 h-4" /> Ready to use
                        </span>
                    </div>
                </div>
                <div className="p-6">
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                        <p>No setup needed! When creating a live class:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Select <strong>YouTube</strong> as the platform</li>
                            <li>Paste any YouTube URL (live stream, unlisted, or public video)</li>
                            <li>Students see the video embedded directly inside the app</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
