import { useState } from 'react';
import { Ticket, CheckCircle, Clock, ChevronDown, ChevronUp, Loader2, User, Phone, MessageCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { useTenant } from '@/app/providers/TenantProvider';
import { format } from 'date-fns';

interface SupportTicket {
    id: string;
    student_id: string | null;
    student_name: string | null;
    phone?: string | null;
    subject: string;
    description: string;
    status: 'open' | 'resolved';
    created_at: string;
}

export const SupportTickets = () => {
    const { coachingId } = useTenant();
    const queryClient = useQueryClient();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

    const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
        queryKey: ['support_tickets', coachingId, filter],
        queryFn: async () => {
            // Step 1: fetch tickets
            let query = supabase
                .from('support_tickets')
                .select('*')
                .eq('coaching_id', coachingId!)
                .order('created_at', { ascending: false });
            if (filter !== 'all') query = query.eq('status', filter);
            const { data: ticketsData, error } = await query;
            if (error) throw error;
            if (!ticketsData || ticketsData.length === 0) return [];

            // Step 2: fetch phones from users table for all student_ids
            const studentIds = ticketsData
                .map(t => t.student_id)
                .filter(Boolean) as string[];

            let phoneMap: Record<string, string | null> = {};
            if (studentIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, phone')
                    .in('id', studentIds);
                if (usersData) {
                    usersData.forEach(u => { phoneMap[u.id] = u.phone; });
                }
            }

            // Merge phone into each ticket
            return ticketsData.map(t => ({
                ...t,
                phone: t.student_id ? (phoneMap[t.student_id] ?? null) : null,
            })) as SupportTicket[];
        },
        enabled: !!coachingId,
    });

    const resolveTicket = useMutation({
        mutationFn: async (ticketId: string) => {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: 'resolved' })
                .eq('id', ticketId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support_tickets', coachingId] });
        },
    });

    const openCount = tickets.filter(t => t.status === 'open').length;

    return (
        <div className="pb-12 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Issues submitted by students</p>
                </div>
                {openCount > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm font-medium text-orange-700">
                        <Clock className="w-4 h-4" />
                        {openCount} open {openCount === 1 ? 'ticket' : 'tickets'}
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 w-fit">
                {(['all', 'open', 'resolved'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center py-16 gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Ticket className="w-7 h-7 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No {filter !== 'all' ? filter : ''} tickets yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tickets.map((ticket) => {
                            const phone = ticket.phone || null;
                            return (
                                <div key={ticket.id} className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <User className="w-4 h-4 text-indigo-500" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                                <span className="font-semibold text-sm text-gray-900">{ticket.student_name || 'Student'}</span>
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${ticket.status === 'open'
                                                    ? 'bg-orange-50 text-orange-600'
                                                    : 'bg-green-50 text-green-600'
                                                    }`}>
                                                    {ticket.status === 'open' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                                    {ticket.status}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-auto">
                                                    {format(new Date(ticket.created_at), 'dd MMM yyyy, hh:mm a')}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-800">{ticket.subject}</p>

                                            <button
                                                onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                                                className="text-xs text-indigo-500 hover:text-indigo-700 mt-1 flex items-center gap-1"
                                            >
                                                {expandedId === ticket.id
                                                    ? <><ChevronUp className="w-3 h-3" /> Hide details</>
                                                    : <><ChevronDown className="w-3 h-3" /> View details</>
                                                }
                                            </button>

                                            {expandedId === ticket.id && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100">
                                                    {ticket.description}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                                            {/* Contact Student — phone comes from users table via join */}
                                            {phone ? (
                                                <div className="flex items-center gap-1.5">
                                                    <a
                                                        href={`tel:${phone}`}
                                                        title={`Call ${phone}`}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                                    >
                                                        <Phone className="w-3.5 h-3.5" />
                                                        {phone}
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="WhatsApp"
                                                        className="p-1.5 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No phone</span>
                                            )}

                                            {/* Mark Resolved */}
                                            {ticket.status === 'open' && (
                                                <button
                                                    onClick={() => resolveTicket.mutate(ticket.id)}
                                                    disabled={resolveTicket.isPending}
                                                    className="px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200 disabled:opacity-50 flex items-center gap-1.5"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Mark Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
