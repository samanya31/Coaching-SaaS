import { useState, useEffect, useRef } from 'react';
import { User, Lock, Users, Shield, Key, BookOpen, Phone, Mail, MessageCircle, Save, HardDrive, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaffSettings } from './settings/StaffSettings';
import { RoleSettings } from './settings/RoleSettings';
import { ExamGoalsSettings } from './settings/ExamGoalsSettings';
import { StorageSettings } from './settings/StorageSettings';
import { IntegrationsSettings } from './settings/IntegrationsSettings';
import { useTenant } from '@/app/providers/TenantProvider';
import { supabase } from '@/config/supabase';
import { toast } from 'sonner';
import r2 from '@/services/r2.service';

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

type TabType = 'branding' | 'contact' | 'staff' | 'roles' | 'goals' | 'profile' | 'storage' | 'integrations';

export const Settings = () => {
    const { coaching, refreshTenant } = useTenant();
    const [activeTab, setActiveTab] = useState<TabType>('contact');

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

    const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
        { key: 'contact', label: 'Contact Details', icon: Phone },
        { key: 'staff', label: 'Staff', icon: Users },
        { key: 'roles', label: 'Roles', icon: Shield },
        { key: 'goals', label: 'Exam Goals', icon: BookOpen },
        { key: 'profile', label: 'My Profile', icon: User },
        { key: 'storage', label: 'Storage', icon: HardDrive },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your coaching portal, team, and permissions</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 w-fit">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === key ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">

                {/* ── CONTACT TAB ───────────────────────────────────────────── */}
                {activeTab === 'contact' && (
                    <div className="p-6 max-w-2xl">
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Contact Details</h2>
                        <p className="text-sm text-gray-500 mb-6">Shown to students on the Help & Support page.</p>
                        <form onSubmit={handleContactSave} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="tel" value={contactData.support_phone}
                                        onChange={(e) => setContactData({ ...contactData, support_phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="email" value={contactData.support_email}
                                        onChange={(e) => setContactData({ ...contactData, support_email: e.target.value })}
                                        placeholder="support@institute.com"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">WhatsApp <span className="text-gray-400 font-normal">(optional)</span></label>
                                <div className="relative">
                                    <MessageCircle className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="tel" value={contactData.support_whatsapp}
                                        onChange={(e) => setContactData({ ...contactData, support_whatsapp: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                            <Button type="submit" disabled={isSavingContact} className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                {isSavingContact ? 'Saving...' : 'Save Contact Details'}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Staff / Roles / Goals tabs */}
                {activeTab === 'staff' && <StaffSettings />}
                {activeTab === 'roles' && <RoleSettings />}
                {activeTab === 'goals' && <ExamGoalsSettings />}
                {activeTab === 'storage' && <StorageSettings />}

                {/* ── PROFILE TAB ───────────────────────────────────────────── */}
                {activeTab === 'profile' && (
                    <div className="p-6 max-w-2xl">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="password" value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="Enter new password" minLength={6} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input type="password" value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="Confirm new password" required />
                                </div>
                            </div>
                            <Button type="submit" disabled={isChangingPassword}>
                                {isChangingPassword ? 'Changing...' : 'Change Password'}
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
