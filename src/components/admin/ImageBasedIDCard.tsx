import { QRCodeSVG } from 'qrcode.react';
import { ImageTemplateConfig } from '@/data/imageTemplateConfigs';

interface ImageBasedIDCardProps {
    student: {
        id: string;
        name: string;
        email?: string;
        phone: string;
        examGoal: string;
        avatar?: string;
        registrationDate: string;
    };
    template: ImageTemplateConfig;
}

export const ImageBasedIDCard = ({ student, template }: ImageBasedIDCardProps) => {
    const validUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="space-y-8">
            {/* Front Side */}
            <div className="relative w-[400px] h-[250px] rounded-xl shadow-2xl overflow-hidden">
                {/* Background Template Image */}
                <img
                    src={template.frontImageUrl}
                    alt="ID Card Template Front"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay Student Photo */}
                <div
                    className="absolute overflow-hidden"
                    style={{
                        left: `${template.photo.x}px`,
                        top: `${template.photo.y}px`,
                        width: `${template.photo.width}px`,
                        height: `${template.photo.height}px`,
                        borderRadius: template.photo.borderRadius ? `${template.photo.borderRadius}px` : '0'
                    }}
                >
                    <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Overlay Student Name */}
                <div
                    className="absolute"
                    style={{
                        left: `${template.studentName.x}px`,
                        top: `${template.studentName.y}px`,
                        fontSize: `${template.studentName.fontSize}px`,
                        color: template.studentName.color,
                        fontWeight: template.studentName.fontWeight || 700,
                        maxWidth: template.studentName.maxWidth ? `${template.studentName.maxWidth}px` : 'auto',
                        lineHeight: '1.2'
                    }}
                >
                    {student.name}
                </div>

                {/* Overlay Student ID */}
                <div
                    className="absolute font-mono"
                    style={{
                        left: `${template.studentId.x}px`,
                        top: `${template.studentId.y}px`,
                        fontSize: `${template.studentId.fontSize}px`,
                        color: template.studentId.color
                    }}
                >
                    {student.id}
                </div>

                {/* Overlay Exam Goal */}
                <div
                    className="absolute"
                    style={{
                        left: `${template.examGoal.x}px`,
                        top: `${template.examGoal.y}px`,
                        fontSize: `${template.examGoal.fontSize}px`,
                        color: template.examGoal.color
                    }}
                >
                    {student.examGoal}
                </div>

                {/* Overlay Valid Until (if configured) */}
                {template.validUntil && (
                    <div
                        className="absolute"
                        style={{
                            left: `${template.validUntil.x}px`,
                            top: `${template.validUntil.y}px`,
                            fontSize: `${template.validUntil.fontSize}px`,
                            color: template.validUntil.color
                        }}
                    >
                        Valid Until: {validUntil}
                    </div>
                )}
            </div>

            {/* Back Side */}
            {template.back && (
                <div className="relative w-[400px] h-[250px] rounded-xl shadow-2xl overflow-hidden">
                    {/* Background Template Image */}
                    <img
                        src={template.backImageUrl}
                        alt="ID Card Template Back"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Overlay Email */}
                    {template.back.email && (
                        <div
                            className="absolute"
                            style={{
                                left: `${template.back.email.x}px`,
                                top: `${template.back.email.y}px`,
                                fontSize: `${template.back.email.fontSize}px`,
                                color: template.back.email.color
                            }}
                        >
                            {student.email || 'N/A'}
                        </div>
                    )}

                    {/* Overlay Phone */}
                    {template.back.phone && (
                        <div
                            className="absolute"
                            style={{
                                left: `${template.back.phone.x}px`,
                                top: `${template.back.phone.y}px`,
                                fontSize: `${template.back.phone.fontSize}px`,
                                color: template.back.phone.color
                            }}
                        >
                            {student.phone}
                        </div>
                    )}

                    {/* Overlay Enrollment Date */}
                    {template.back.enrollmentDate && (
                        <div
                            className="absolute"
                            style={{
                                left: `${template.back.enrollmentDate.x}px`,
                                top: `${template.back.enrollmentDate.y}px`,
                                fontSize: `${template.back.enrollmentDate.fontSize}px`,
                                color: template.back.enrollmentDate.color
                            }}
                        >
                            {new Date(student.registrationDate).toLocaleDateString('en-IN')}
                        </div>
                    )}

                    {/* Overlay QR Code */}
                    {template.back.qrCode && (
                        <div
                            className="absolute"
                            style={{
                                left: `${template.back.qrCode.x}px`,
                                top: `${template.back.qrCode.y}px`,
                            }}
                        >
                            <QRCodeSVG
                                value={`https://examedge.com/verify/${student.id}`}
                                size={template.back.qrCode.size}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
