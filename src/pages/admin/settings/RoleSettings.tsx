import { useState } from 'react';
import { Plus, Trash2, Shield, Edit2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoles, useCreateRole, useDeleteRole } from '@/hooks/data/useRoles';

const AVAILABLE_PERMISSIONS = [
    { id: 'manage_students', label: 'Manage Students (Add, Edit, Delete)' },
    { id: 'manage_content', label: 'Manage Content (Courses, Live Classes)' },
    { id: 'view_reports', label: 'View Reports & Analytics' },
    { id: 'manage_settings', label: 'Manage Settings' },
    { id: 'manage_staff', label: 'Manage Staff & Roles' },
];

export const RoleSettings = () => {
    const { data: roles = [], isLoading } = useRoles();
    const { mutate: createRole } = useCreateRole();
    const { mutate: deleteRole } = useDeleteRole();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        permissions: [] as string[]
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const code = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

        createRole({
            name: formData.name,
            code,
            permissions: formData.permissions
        }, {
            onSuccess: () => {
                setIsModalOpen(false);
                setFormData({ name: '', permissions: [] });
            }
        });
    };

    const togglePermission = (permId: string) => {
        setFormData(prev => {
            if (prev.permissions.includes(permId)) {
                return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
            } else {
                return { ...prev, permissions: [...prev.permissions, permId] };
            }
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this role? Users assigned to this role may lose access.')) {
            deleteRole(id);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Role Management</h2>
                    <p className="text-sm text-gray-500">Create custom roles with specific permissions</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Role
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading roles...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* System Roles (Read-only visualization) */}
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Admin (System)</h3>
                                    <p className="text-xs text-gray-500">Full Access</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Teacher (System)</h3>
                                    <p className="text-xs text-gray-500">Manage Content & Students</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Roles */}
                    {roles.filter(r => !r.is_system).map((role) => (
                        <div key={role.id} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-all group bg-white">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{role.name}</h3>
                                        <p className="text-xs text-gray-500">{role.permissions.length} permissions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(role.id)}
                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                                {role.permissions.slice(0, 3).map(p => (
                                    <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                                        {p.replace('manage_', '').replace('view_', '')}
                                    </span>
                                ))}
                                {role.permissions.length > 3 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                                        +{role.permissions.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Role Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Custom Role</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Role Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    placeholder="e.g. Senior Teacher"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Permissions</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-100 rounded-lg">
                                    {AVAILABLE_PERMISSIONS.map(perm => (
                                        <label key={perm.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Create Role</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
