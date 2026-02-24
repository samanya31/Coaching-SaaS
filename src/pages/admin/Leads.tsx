import { useState } from 'react';
import { Search, Filter, Phone, User as UserIcon, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeads, useUpdateLeadStatus, useDeleteLead } from '@/hooks/data/useLeads';
import { format } from 'date-fns';

export const Leads = () => {
    // Fetch data
    const { data: leads = [], isLoading } = useLeads();
    const updateStatus = useUpdateLeadStatus();
    const deleteLead = useDeleteLead();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery) ||
            lead.course_interest?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = (leadId: string, newStatus: string) => {
        updateStatus.mutate({ leadId, status: newStatus });
    };

    const handleDelete = (leadId: string) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            deleteLead.mutate(leadId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading leads...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
                    <p className="text-gray-600 mt-1">Manage new student inquiries and onboarding</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                        Total Leads: {leads.length}
                    </div>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium">
                        New: {leads.filter(l => l.status === 'new').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name & Phone</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Course Interest</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Language</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                {lead.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{lead.name}</p>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Phone className="w-3 h-3" />
                                                    {lead.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {lead.course_interest || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {lead.language_preference || 'English'}
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {format(new Date(lead.created_at), 'MMM d, yyyy')}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                            className={`
                                                px-3 py-1 rounded-full text-sm font-medium border-none focus:ring-2 focus:ring-offset-1 cursor-pointer
                                                ${lead.status === 'new' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                                ${lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}
                                                ${lead.status === 'converted' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                                ${lead.status === 'archived' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
                                            `}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="converted">Enrolled</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {lead.status !== 'converted' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleStatusChange(lead.id, 'converted')}
                                                    title="Enroll Student"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(lead.id)}
                                                title="Delete Lead"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        No leads found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
