import { useState } from 'react';
import { Plus, Trash2, Mail, Lock, User, RefreshCw, Key, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUsers, useDeleteUser } from '@/hooks/data/useUsers';
import { useRoles } from '@/hooks/data/useRoles';
import { supabase } from '@/config/supabase';
import { useTenant } from '@/app/providers/TenantProvider';
import { UserRole } from '@/types/user';

export const StaffSettings = () => {
    const { coachingId } = useTenant();
    const { data: allUsers = [], isLoading: isUsersLoading } = useUsers();
    const { data: roles = [], isLoading: isRolesLoading } = useRoles();
    const { mutate: deleteUser } = useDeleteUser();

    // Filter to show only staff (admins, teachers)
    const staffMembers = allUsers.filter(u => u.role !== 'student');

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'teacher' as string, // default
        role_id: '' as string
    });

    // Password Reset State
    const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
    const [selectedStaffForReset, setSelectedStaffForReset] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password }));
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Import bcrypt dynamically
            const bcrypt = await import('bcryptjs');

            // Direct database insertion approach (no Edge Function needed!)
            // This works like your project folder's AdminManagement.tsx

            // Simple role selection - only system roles (no custom roles)
            // coaching_admin: Full access
            // staff: Students + Instructors
            // teacher: Batches + Tests + Announcements
            const effectiveRole = formData.role; // Use directly, no custom role logic
            const effectiveRoleId = null; // No custom roles

            // Generate a unique ID for the staff member
            const staffId = crypto.randomUUID();

            // Hash the password with bcrypt (PRODUCTION SECURE!)
            const hashedPassword = await bcrypt.hash(formData.password, 10);

            // Insert directly into users table
            const { error: insertError } = await supabase.from('users').insert({
                id: staffId,
                email: formData.email,
                full_name: formData.name,
                role: effectiveRole,
                role_id: effectiveRoleId,
                coaching_id: coachingId,
                status: 'active',
                password_hash: hashedPassword, // ✅ Now hashed securely!
            });

            if (insertError) {
                console.error('Insert error:', insertError);
                throw new Error(insertError.message);
            }

            // Success! Show credentials to admin
            alert(`✅ Staff member created successfully!\n\nCredentials:\nEmail: ${formData.email}\nPassword: ${formData.password}\n\n⚠️ Save these credentials - they can't be recovered!`);

            setIsInviteOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'teacher', role_id: '' });

            // Refresh the staff list
            window.location.reload();

        } catch (error: any) {
            console.error('Failed to create staff:', error);
            alert('Failed to create staff: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this staff member?')) {
            deleteUser(id);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('reset-password', {
                body: {
                    user_id: selectedStaffForReset.id,
                    new_password: newPassword
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            alert(`Password reset successfully for ${selectedStaffForReset.full_name}!\nNew password: ${newPassword}`);
            setIsResetPasswordOpen(false);
            setSelectedStaffForReset(null);
            setNewPassword('');
        } catch (error: any) {
            console.error('Failed to reset password:', error);
            alert('Failed to reset password: ' + (error.message || 'Unknown error. Make sure the Edge Function is deployed.'));
        } finally {
            setIsLoading(false);
        }
    };

    const generateResetPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(password);
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Staff Management</h2>
                    <p className="text-sm text-gray-500">Manage admins, teachers, and staff roles</p>
                </div>
                <Button onClick={() => setIsInviteOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff Member
                </Button>
            </div>

            {isUsersLoading ? (
                <div className="text-center py-8">Loading staff...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffMembers.map((member) => (
                        <div key={member.id} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-all group bg-white shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                        {member.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{member.full_name}</h3>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setSelectedStaffForReset(member);
                                            setIsResetPasswordOpen(true);
                                        }}
                                        className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                        title="Reset Password"
                                    >
                                        <KeyRound className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                        title="Remove member"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-md capitalize ${member.role === 'coaching_admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                                    }`}>
                                    {member.role?.replace('_', ' ')}
                                </span>
                                {member.status === 'active' && (
                                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md">
                                        Active
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Staff Modal */}
            {isInviteOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Staff</h3>
                        <form onSubmit={handleInvite} className="space-y-4">

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex justify-between">
                                    Password
                                    <span
                                        onClick={generatePassword}
                                        className="text-xs text-indigo-600 cursor-pointer hover:underline flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Generate
                                    </span>
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                                        placeholder="Secure password"
                                    />
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="coaching_admin">Admin - Full Access</option>
                                    <option value="staff">Staff - Students & Instructors</option>
                                    <option value="teacher">Teacher - Batches & Tests</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {isResetPasswordOpen && selectedStaffForReset && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Reset Password: {selectedStaffForReset.full_name}
                        </h3>
                        <form onSubmit={handleResetPassword} className="space-y-4">

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex justify-between">
                                    New Password
                                    <span
                                        onClick={generateResetPassword}
                                        className="text-xs text-indigo-600 cursor-pointer hover:underline flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Generate
                                    </span>
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                                        placeholder="Enter new password"
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    💡 This password will be shown only once. Make sure to copy it!
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsResetPasswordOpen(false);
                                        setSelectedStaffForReset(null);
                                        setNewPassword('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
