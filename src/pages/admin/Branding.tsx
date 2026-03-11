import { useState, useEffect, useRef } from 'react';
import { Building2, Check, Image, Palette, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/app/providers/TenantProvider';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';
import r2 from '@/services/r2.service';
import { usePlanFeatures } from '@/hooks/data/usePlan';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PRESET_COLORS = [
    { name: 'Orange', hex: '#E25822' },
    { name: 'Indigo', hex: '#4F46E5' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Rose', hex: '#E11D48' },
    { name: 'Sky', hex: '#0284C7' },
    { name: 'Violet', hex: '#7C3AED' },
    { name: 'Amber', hex: '#D97706' },
    { name: 'Teal', hex: '#0D9488' },
];

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #f97316 0%, #ea580c 30%, #dc2626 65%, #7c3aed 100%)';

const PRESET_GRADIENTS = [
    { name: 'Sunset', value: 'linear-gradient(135deg, #f97316 0%, #ea580c 30%, #dc2626 65%, #7c3aed 100%)' },
    { name: 'Ocean', value: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #7c3aed 100%)' },
    { name: 'Forest', value: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)' },
    { name: 'Rose', value: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 40%, #be185d 100%)' },
    { name: 'Royal', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #be185d 100%)' },
    { name: 'Gold', value: 'linear-gradient(135deg, #d97706 0%, #f59e0b 40%, #f97316 100%)' },
    { name: 'Night', value: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)' },
    { name: 'Aurora', value: 'linear-gradient(135deg, #10b981 0%, #06b6d4 40%, #8b5cf6 100%)' },
];

export const Branding = () => {
    const { coaching, refreshTenant, coachingId } = useTenant();
    const { canUseBranding, isLoading: isPlanLoading } = usePlanFeatures(coachingId);

    // ─── BRANDING STATE ──────────────────────────────────────────────────────
    const [brandingData, setBrandingData] = useState({
        name: '',
        primary_color: '#E25822',
        logo_url: '',
    });
    const [bannerGradient, setBannerGradient] = useState(DEFAULT_GRADIENT);
    const [isSavingBranding, setIsSavingBranding] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (coaching) {
            setBrandingData({
                name: coaching.name || '',
                primary_color: coaching.primary_color || '#E25822',
                logo_url: coaching.logo_url || '',
            });
            setLogoPreview(coaching.logo_url || '');
            setBannerGradient(coaching.settings?.banner_gradient || DEFAULT_GRADIENT);
        }
    }, [coaching]);

    if (isPlanLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!canUseBranding) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Branding is Locked</h2>
                <p className="text-gray-600 max-w-sm mb-8">
                    Custom logos, colors, and gradients are available on the **Advanced** and **Pro** plans. Upgrade to reflect your brand identity.
                </p>
                <Link to="/admin/dashboard/settings/plans">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8">
                        View Upgrade Options
                    </Button>
                </Link>
            </div>
        );
    }

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleLogoUpload = async (): Promise<string | null> => {
        if (!logoFile || !coaching?.id) return null;
        setIsUploadingLogo(true);
        try {
            // Upload to R2: institutes/{coachingId}/logos/{uuid}-{filename}
            const publicUrl = await r2.upload(coaching.id, 'logos', logoFile);
            setLogoPreview(publicUrl);
            return publicUrl;
        } catch (err: any) {
            toast.error('Logo upload failed: ' + err.message);
            return null;
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleBrandingSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coaching?.id) return;
        setIsSavingBranding(true);
        try {
            let logoUrl = brandingData.logo_url;
            if (logoFile) {
                const uploaded = await handleLogoUpload();
                if (uploaded) logoUrl = uploaded;
            }
            // Persist gradient in settings JSONB
            const updatedSettings = {
                ...(coaching.settings || {}),
                banner_gradient: bannerGradient,
            };
            const { error } = await supabase
                .from('coachings')
                .update({
                    name: brandingData.name.trim(),
                    primary_color: brandingData.primary_color,
                    logo_url: logoUrl,
                    settings: updatedSettings,
                })
                .eq('id', coaching.id);
            if (error) throw error;
            await refreshTenant();
            setLogoFile(null);
            toast.success('Branding saved! Students will see the new look on their next visit.');
        } catch (err: any) {
            toast.error('Failed to save branding: ' + (err.message || 'Unknown error'));
        } finally {
            setIsSavingBranding(false);
        }
    };

    // ─── CONTACT STATE ────────────────────────────────────────────────────────
    const [contactData, setContactData] = useState({
        support_phone: '',
        support_email: '',
        support_whatsapp: '',
    });
    const [isSavingContact, setIsSavingContact] = useState(false);

    useEffect(() => {
        if (coaching?.settings) {
            setContactData({
                support_phone: coaching.settings.support_phone || '',
                support_email: coaching.settings.support_email || '',
                support_whatsapp: coaching.settings.support_whatsapp || '',
            });
        }
    }, [coaching]);

    const handleContactSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coaching?.id) return;
        setIsSavingContact(true);
        try {
            const updatedSettings = { ...(coaching.settings || {}), ...contactData };
            const { error } = await supabase
                .from('coachings')
                .update({ settings: updatedSettings })
                .eq('id', coaching.id);
            if (error) throw error;
            await refreshTenant();
            toast.success('Contact details saved!');
        } catch (err: any) {
            toast.error('Failed to save: ' + (err.message || 'Unknown error'));
        } finally {
            setIsSavingContact(false);
        }
    };

    // ─── PASSWORD STATE ───────────────────────────────────────────────────────
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match!');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters!');
            return;
        }
        setIsChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
            if (error) throw error;
            toast.success('Password changed successfully!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error('Failed to change password: ' + (error.message || 'Unknown error'));
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Branding</h1>
                <p className="text-gray-500">Customize how your coaching portal looks to students.</p>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 max-w-3xl">

                    <form onSubmit={handleBrandingSave} className="space-y-8">

                        {/* Coaching Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Coaching Name
                            </label>
                            <input
                                type="text"
                                value={brandingData.name}
                                onChange={(e) => setBrandingData(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Sharma Academy"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                            <p className="text-xs text-gray-400">This name appears in the student portal header.</p>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Image className="w-4 h-4" /> Coaching Logo
                            </label>
                            <div className="flex items-center gap-6">
                                {/* Preview */}
                                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Image className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => logoInputRef.current?.click()}
                                            className="flex items-center gap-2"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {logoFile ? 'Change Logo' : 'Upload Logo'}
                                        </Button>
                                        {(logoPreview || logoFile) && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => { setLogoFile(null); setLogoPreview(''); setBrandingData(p => ({ ...p, logo_url: '' })); }}
                                                className="text-red-500 border-red-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {logoFile && <p className="text-xs text-indigo-600">✓ {logoFile.name} ready to upload</p>}
                                    <p className="text-xs text-gray-400">PNG, JPG, WEBP or SVG. Max 5MB.</p>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Color */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Sidebar Accent Color
                            </label>
                            <div className="flex flex-wrap gap-3 items-center">
                                {PRESET_COLORS.map(({ name, hex }) => (
                                    <button
                                        key={hex}
                                        type="button"
                                        title={name}
                                        onClick={() => setBrandingData(p => ({ ...p, primary_color: hex }))}
                                        className="relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                                        style={{
                                            backgroundColor: hex,
                                            borderColor: brandingData.primary_color === hex ? '#1e293b' : 'transparent',
                                            boxShadow: brandingData.primary_color === hex ? '0 0 0 3px white, 0 0 0 5px #1e293b' : undefined
                                        }}
                                    >
                                        {brandingData.primary_color === hex && (
                                            <Check className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />
                                        )}
                                    </button>
                                ))}
                                {/* Custom Color */}
                                <div className="flex items-center gap-2 ml-2">
                                    <span className="text-xs text-gray-500">Custom:</span>
                                    <input
                                        type="color"
                                        value={brandingData.primary_color}
                                        onChange={(e) => setBrandingData(p => ({ ...p, primary_color: e.target.value }))}
                                        className="w-9 h-9 rounded-full cursor-pointer border border-gray-200"
                                        title="Pick custom color"
                                    />
                                    <span className="text-xs font-mono text-gray-600">{brandingData.primary_color}</span>
                                </div>
                            </div>

                            {/* Live Preview Strip */}
                            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                                <div className="text-xs font-medium text-gray-500 px-3 py-1.5 bg-gray-50 border-b border-gray-200">Preview</div>
                                <div className="flex" style={{ backgroundColor: '#f8fafc' }}>
                                    <div className="w-40 bg-white p-3 space-y-1 border-r border-gray-100">
                                        {['Dashboard', 'Batches', 'Tests', 'Settings'].map((item, i) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-2 px-3 py-2 rounded-r-full text-xs font-medium border-l-4"
                                                style={i === 0 ? {
                                                    backgroundColor: brandingData.primary_color + '18',
                                                    color: brandingData.primary_color,
                                                    borderColor: brandingData.primary_color
                                                } : {
                                                    color: '#64748b',
                                                    borderColor: 'transparent'
                                                }}
                                            >
                                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: i === 0 ? brandingData.primary_color : '#cbd5e1' }} />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="" className="h-7 w-auto object-contain" />
                                            ) : (
                                                <div className="w-7 h-7 rounded bg-gray-200" />
                                            )}
                                            <span className="font-bold text-sm" style={{ color: brandingData.primary_color }}>
                                                {brandingData.name || 'Your Coaching'}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded w-3/4 mb-1.5" />
                                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Banner Gradient */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Student Dashboard Banner Gradient
                            </label>
                            <p className="text-xs text-gray-400">This gradient appears behind the background image on the student dashboard welcome banner.</p>
                            <div className="flex flex-wrap gap-3">
                                {PRESET_GRADIENTS.map((g) => (
                                    <button
                                        key={g.name}
                                        type="button"
                                        title={g.name}
                                        onClick={() => setBannerGradient(g.value)}
                                        className="relative w-14 h-9 rounded-lg border-2 transition-all hover:scale-105 overflow-hidden"
                                        style={{
                                            background: g.value,
                                            borderColor: bannerGradient === g.value ? '#1e293b' : 'transparent',
                                            boxShadow: bannerGradient === g.value ? '0 0 0 3px white, 0 0 0 5px #1e293b' : undefined
                                        }}
                                    >
                                        {bannerGradient === g.value && (
                                            <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow" strokeWidth={3} />
                                        )}
                                        <span className="absolute bottom-0 inset-x-0 text-[8px] text-white/90 text-center pb-0.5 bg-black/20">{g.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Banner Preview */}
                            <div
                                className="mt-2 rounded-xl h-14 flex items-center px-4 gap-3 relative overflow-hidden"
                                style={{ background: bannerGradient }}
                            >
                                <div className="text-white">
                                    <p className="text-xs font-bold">Welcome back, Student!</p>
                                    <p className="text-[10px] text-white/70">0 classes today. Keep it up!</p>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <span className="px-2 py-0.5 bg-white text-[9px] font-bold text-gray-700 rounded-md">Resume Learning</span>
                                    <span className="px-2 py-0.5 bg-white/20 text-[9px] font-semibold text-white rounded-md border border-white/30">View Schedule</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSavingBranding || isUploadingLogo}
                            className="flex items-center gap-2"
                            style={{ backgroundColor: brandingData.primary_color }}
                        >
                            <Save className="w-4 h-4" />
                            {isSavingBranding || isUploadingLogo ? 'Saving...' : 'Save Branding'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};



