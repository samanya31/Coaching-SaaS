
import { useState, useRef } from 'react';
import { ArrowLeft, Download, Printer, QrCode, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/hooks/data/useUsers';
import { idCardTemplates } from '@/data/idCardTemplates';
import { QRCodeSVG } from 'qrcode.react';
import { PremiumIDCard } from '@/components/admin/PremiumIDCard';

export const IDCardGenerator = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const cardRef = useRef<HTMLDivElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState(idCardTemplates[0]);

    const { data: user, isLoading } = useUser(id || '');

    // Map user to student format expected by template
    const student = user ? {
        id: user.student_id || user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone || 'N/A',
        avatar: user.avatar_url || 'https://via.placeholder.com/150',
        examGoal: user.exam_goal || 'General',
        registrationDate: user.created_at || new Date().toISOString()
    } : null;

    if (isLoading) return <div className="text-center py-12">Loading...</div>;

    if (!id || !student) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Student not found</p>
                <Button onClick={() => navigate('/admin/dashboard/students')} className="mt-4">
                    Back to Students
                </Button>
            </div>
        );
    }

    const handleDownload = () => {
        // In a real app, this would use html2canvas or similar library
        alert('Download functionality would use html2canvas to convert the card to an image');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard/students')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Student ID Card</h1>
                        <p className="text-gray-600">Generate and download ID card for {student.name}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    <Button onClick={handleDownload} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                </div>
            </div>

            {/* Template Selector */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 print:hidden mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-indigo-600" />
                        <div>
                            <h3 className="font-bold text-gray-900">Choose Card Template</h3>
                            <p className="text-sm text-gray-500">Select a design for the ID card</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {idCardTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${selectedTemplate.id === template.id
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ID Card Preview */}
            <div className="flex justify-center items-center min-h-[600px] bg-gray-50 rounded-xl p-8">
                {selectedTemplate.id === 'template-premium' ? (
                    <PremiumIDCard student={student} />
                ) : (
                    <div className="space-y-8">
                        {/* Front Side */}
                        <div
                            ref={cardRef}
                            className={`relative w-[400px] h-[250px] bg-gradient-to-br ${selectedTemplate.primaryColor} ${selectedTemplate.borderStyle === 'rounded' ? 'rounded-2xl' :
                                selectedTemplate.borderStyle === 'extra-rounded' ? 'rounded-3xl' :
                                    'rounded-lg'
                                } shadow-2xl overflow-hidden`}
                        >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
                            </div>

                            {/* Content */}
                            <div className="relative h-full p-6 flex flex-col">
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <h2 className="text-white font-bold text-lg">ExamEdge Academy</h2>
                                    <p className={`text-${selectedTemplate.secondaryColor}-100 text-xs`}>Student Identification Card</p>
                                </div>

                                {/* Main Content */}
                                <div className="flex gap-4 flex-1">
                                    {/* Photo */}
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-28 bg-white rounded-lg overflow-hidden border-2 border-white shadow-lg">
                                            <img
                                                src={student.avatar}
                                                alt={student.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 text-white space-y-2">
                                        <div>
                                            <p className={`text-xs text-${selectedTemplate.secondaryColor}-200`}>Name</p>
                                            <p className="font-bold text-sm">{student.name}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs text-${selectedTemplate.secondaryColor}-200`}>Student ID</p>
                                            <p className="font-mono text-sm font-semibold">{student.id}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs text-${selectedTemplate.secondaryColor}-200`}>Exam Goal</p>
                                            <p className="text-sm font-medium">{student.examGoal}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs text-${selectedTemplate.secondaryColor}-200`}>Valid Until</p>
                                            <p className="text-sm">
                                                {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className={`text-center border-t border-${selectedTemplate.secondaryColor}-400 pt-2`}>
                                    <p className={`text-${selectedTemplate.secondaryColor}-100 text-[10px]`}>www.examedge.com | support@examedge.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Back Side */}
                        <div className="relative w-[400px] h-[250px] bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
                            <div className="h-full p-6 flex flex-col">
                                {/* Header */}
                                <div className="text-center mb-4 pb-3 border-b-2 border-gray-200">
                                    <h3 className="font-bold text-gray-900 text-sm">Important Information</h3>
                                </div>

                                {/* Content */}
                                <div className="flex gap-6 flex-1">
                                    {/* Contact Info */}
                                    <div className="flex-1 space-y-3 text-xs">
                                        <div>
                                            <p className="text-gray-500 font-medium">Email</p>
                                            <p className="text-gray-900 font-semibold">{student.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium">Phone</p>
                                            <p className="text-gray-900 font-semibold">{student.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium">Enrollment Date</p>
                                            <p className="text-gray-900 font-semibold">
                                                {new Date(student.registrationDate).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-[10px] text-gray-500 italic">
                                                This card is non-transferable and must be carried at all times during classes.
                                            </p>
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 p-2">
                                            <QRCodeSVG
                                                value={`https://examedge.com/verify/${student.id}`}
                                                size={80}
                                                level="H"
                                                includeMargin={false}
                                            />
                                        </div>
                                        <p className="text-[9px] text-gray-500 mt-2 text-center">Scan for verification</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="text-center border-t border-gray-200 pt-2 mt-2">
                                    <p className="text-gray-600 text-[10px]">
                                        In case of loss, contact: +91 98765 43210
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 print:hidden">
                <h3 className="font-bold text-blue-900 mb-3">How to Use</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>Click <strong>Print</strong> to print the ID card on standard card stock (CR80 size recommended)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>Click <strong>Download</strong> to save as an image (requires html2canvas integration)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>Print both front and back sides on the same card stock</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">4.</span>
                        <span>Laminate the card for durability</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
