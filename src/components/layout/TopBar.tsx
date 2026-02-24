import { Phone, Download } from 'lucide-react';

export const TopBar = () => {
    return (
        <div className="bg-blue-900 text-white py-2 text-sm">
            <div className="container-custom flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>+919876543210</span>
                    </div>
                    <div className="hidden md:block">
                        <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
                    </div>
                </div>
                <a href="#" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download App</span>
                </a>
            </div>
        </div>
    );
};
