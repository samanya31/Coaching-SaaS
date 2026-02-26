import { useState } from 'react';
import { Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTenant } from '@/app/providers/TenantProvider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/config/supabase';

const FAQS = [
    {
        q: 'How do I join a live class?',
        a: 'Go to Live Classes in the sidebar. You will see all upcoming classes. Click "Join Live" when the class starts — the button becomes active a few minutes before start time.',
    },
    {
        q: 'How do I attempt a test?',
        a: 'Navigate to Tests in the sidebar. Select the test you want to attempt and click "Start Test". Make sure you have a stable internet connection before starting.',
    },
    {
        q: 'How do I reset my password?',
        a: 'Go to the Settings page (bottom of the sidebar). You will find a "Change Password" section there. Enter your new password and save.',
    },
    {
        q: 'Why is the video not playing?',
        a: 'Make sure your internet connection is stable. Try refreshing the page. If the issue persists, try a different browser or clear your browser cache.',
    },
    {
        q: 'How do I contact my teacher?',
        a: 'Use the "Report an Issue" form below to send a message. Alternatively, reach out through the contact details above — your institute team will forward your query.',
    },
];

export const StudentHelp = () => {
    const { coaching } = useTenant();
    const { user } = useAuth();

    const phone = coaching?.settings?.support_phone || '';
    const email = coaching?.settings?.support_email || '';
    const whatsapp = coaching?.settings?.support_whatsapp || '';
    const hasContact = phone || email || whatsapp;

    // FAQ accordion
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Ticket form
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coaching?.id) return;
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const { error } = await supabase.from('support_tickets').insert([{
                coaching_id: coaching.id,
                student_id: user?.id || null,
                student_name: user?.name || 'Student',
                subject,
                description,
                status: 'open',
            }]);
            if (error) throw error;
            setSubmitted(true);
            setSubject('');
            setDescription('');
        } catch (err: any) {
            setSubmitError(err.message || 'Failed to submit ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-16 space-y-4 px-2 sm:px-4">
            {/* Header */}
            <div className="pt-2">
                <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-500 text-sm mt-1">Get help, read FAQs, or report an issue.</p>
            </div>

            {/* ── Section 1: Contact Institute ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Contact Institute</h2>
                <p className="text-xs text-gray-400 mb-3">Reach out to your coaching directly.</p>

                {!hasContact ? (
                    <p className="text-sm text-gray-400 italic">Contact details not set by admin yet. Check back later.</p>
                ) : (
                    <div className="space-y-2">
                        {phone && (
                            <a
                                href={`tel:${phone}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Call Us</p>
                                    <p className="text-sm font-semibold text-blue-800">{phone}</p>
                                </div>
                            </a>
                        )}
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <Mail className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-purple-500 font-medium uppercase tracking-wide">Email Us</p>
                                    <p className="text-sm font-semibold text-purple-800">{email}</p>
                                </div>
                            </a>
                        )}
                        {whatsapp && (
                            <a
                                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center flex-shrink-0 transition-colors">
                                    <MessageCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-green-500 font-medium uppercase tracking-wide">WhatsApp</p>
                                    <p className="text-sm font-semibold text-green-800">{whatsapp}</p>
                                </div>
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* ── Section 2: FAQs ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Frequently Asked Questions</h2>
                <p className="text-xs text-gray-400 mb-3">Quick answers to common questions.</p>
                <div className="space-y-2">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                                {openFaq === i
                                    ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                }
                            </button>
                            {openFaq === i && (
                                <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3 bg-gray-50/60">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Section 3: Report an Issue ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-0.5">Report an Issue</h2>
                <p className="text-xs text-gray-400 mb-3">Facing a problem? Let us know and we'll get back to you.</p>

                {submitted ? (
                    <div className="flex flex-col items-center py-8 gap-3">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="font-semibold text-gray-800">Ticket Submitted!</p>
                        <p className="text-sm text-gray-500 text-center">Your issue has been sent to the institute. They will get back to you soon.</p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="mt-2 text-sm text-indigo-600 hover:underline"
                        >
                            Submit another issue
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                placeholder="e.g. Video not playing in Module 3"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={4}
                                placeholder="Describe the issue in detail..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                            />
                        </div>
                        {submitError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {submitError}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
                        >
                            {isSubmitting
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                : <><Send className="w-4 h-4" /> Submit Issue</>
                            }
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

