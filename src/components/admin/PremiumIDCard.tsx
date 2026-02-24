import { QRCodeSVG } from 'qrcode.react';
import { Mail, Phone, Calendar } from 'lucide-react';

interface PremiumIDCardProps {
    student: {
        id: string;
        name: string;
        email?: string;
        phone: string;
        examGoal: string;
        avatar?: string;
        registrationDate: string;
    };
}

export const PremiumIDCard = ({ student }: PremiumIDCardProps) => {
    const validUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div className="space-y-8">
            {/* Front Side */}
            <div
                className="relative w-[400px] h-[250px] rounded-2xl shadow-2xl overflow-hidden group"
                style={{
                    background: 'linear-gradient(135deg, #0f3c73, #1456a1, #1e6fd9)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}
            >
                {/* Sheen Effect */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.25), transparent 60%)'
                    }}
                />

                {/* Header */}
                <div
                    className="px-5 py-4 flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, #0f3c73, #1456a1, #1e6fd9)',
                        borderBottom: '1px solid rgba(255,255,255,0.25)'
                    }}
                >
                    <h2
                        className="text-white font-bold tracking-wider text-center"
                        style={{ letterSpacing: '0.05em' }}
                    >
                        EXAMEDGE ACADEMY
                    </h2>
                </div>

                {/* Main Content */}
                <div className="px-5 py-4 flex gap-4 items-start">
                    {/* Photo */}
                    <div
                        className="flex-shrink-0"
                        style={{
                            width: '95px',
                            height: '95px',
                            borderRadius: '12px',
                            border: '2px solid #e6edf7',
                            overflow: 'hidden'
                        }}
                    >
                        <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                        <div>
                            <p
                                className="font-bold"
                                style={{
                                    fontSize: '21px',
                                    fontWeight: 700,
                                    color: 'white',
                                    lineHeight: '1.2'
                                }}
                            >
                                {student.name}
                            </p>
                        </div>

                        <div
                            className="pb-2"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            <p
                                style={{
                                    fontSize: '13px',
                                    color: 'rgba(255,255,255,0.7)',
                                    marginBottom: '2px'
                                }}
                            >
                                Student ID
                            </p>
                            <p
                                className="font-semibold font-mono"
                                style={{
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: 'white'
                                }}
                            >
                                {student.id}
                            </p>
                        </div>

                        <div
                            className="pb-2"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            <p
                                style={{
                                    fontSize: '13px',
                                    color: 'rgba(255,255,255,0.7)',
                                    marginBottom: '2px'
                                }}
                            >
                                Exam Goal
                            </p>
                            <p
                                className="font-semibold"
                                style={{
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: 'white'
                                }}
                            >
                                {student.examGoal}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Validity Strip */}
                <div
                    className="absolute bottom-0 left-0 right-0 px-5 py-2.5 flex items-center justify-between"
                    style={{
                        background: 'linear-gradient(135deg, #0d2d57, #123e7a)',
                    }}
                >
                    <p
                        className="text-white font-semibold"
                        style={{
                            fontSize: '12px',
                            letterSpacing: '0.03em'
                        }}
                    >
                        Valid Until: {validUntil}
                    </p>
                    <p
                        className="text-white text-xs"
                        style={{ opacity: 0.8 }}
                    >
                        ID CARD
                    </p>
                </div>
            </div>

            {/* Back Side */}
            <div
                className="relative w-[400px] h-[250px] bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    border: '1px solid #e6ecf5'
                }}
            >
                {/* Header */}
                <div
                    className="px-5 py-3 text-center"
                    style={{
                        background: 'linear-gradient(135deg, #0f3c73, #1456a1)',
                        borderBottom: '1px solid rgba(255,255,255,0.25)'
                    }}
                >
                    <h3
                        className="text-white font-bold tracking-wide"
                        style={{
                            fontSize: '14px',
                            letterSpacing: '0.05em'
                        }}
                    >
                        STUDENT INFORMATION
                    </h3>
                </div>

                {/* Content */}
                <div className="p-5 flex gap-4">
                    {/* Info Section */}
                    <div className="flex-1 space-y-3">
                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center justify-center"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'rgba(59,111,182,0.12)'
                                }}
                            >
                                <Mail className="w-4 h-4" style={{ color: '#3b6fb6' }} />
                            </div>
                            <div className="flex-1">
                                <p
                                    style={{
                                        fontSize: '11px',
                                        color: '#6b7a90',
                                        marginBottom: '1px'
                                    }}
                                >
                                    Email
                                </p>
                                <p
                                    className="font-semibold"
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#0b1f3a'
                                    }}
                                >
                                    {student.email || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center justify-center"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'rgba(59,111,182,0.12)'
                                }}
                            >
                                <Phone className="w-4 h-4" style={{ color: '#3b6fb6' }} />
                            </div>
                            <div className="flex-1">
                                <p
                                    style={{
                                        fontSize: '11px',
                                        color: '#6b7a90',
                                        marginBottom: '1px'
                                    }}
                                >
                                    Phone
                                </p>
                                <p
                                    className="font-semibold"
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#0b1f3a'
                                    }}
                                >
                                    {student.phone}
                                </p>
                            </div>
                        </div>

                        {/* Registration */}
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center justify-center"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'rgba(59,111,182,0.12)'
                                }}
                            >
                                <Calendar className="w-4 h-4" style={{ color: '#3b6fb6' }} />
                            </div>
                            <div className="flex-1">
                                <p
                                    style={{
                                        fontSize: '11px',
                                        color: '#6b7a90',
                                        marginBottom: '1px'
                                    }}
                                >
                                    Enrolled
                                </p>
                                <p
                                    className="font-semibold"
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#0b1f3a'
                                    }}
                                >
                                    {new Date(student.registrationDate).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center">
                        <div
                            style={{
                                padding: '8px',
                                background: 'white',
                                borderRadius: '10px',
                                border: '1px solid #e6ecf5'
                            }}
                        >
                            <QRCodeSVG
                                value={`https://examedge.com/verify/${student.id}`}
                                size={80}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <p
                            className="mt-2 text-center"
                            style={{
                                fontSize: '9px',
                                color: '#6b7a90'
                            }}
                        >
                            Scan to verify
                        </p>
                    </div>
                </div>

                {/* Disclaimer Strip */}
                <div
                    className="absolute bottom-0 left-0 right-0 px-4 py-2 text-center"
                    style={{
                        background: '#4a5d73',
                    }}
                >
                    <p
                        className="text-white"
                        style={{
                            fontSize: '11px',
                            opacity: 0.9
                        }}
                    >
                        This card is property of ExamEdge Academy. If found, please return.
                    </p>
                </div>
            </div>
        </div>
    );
};
