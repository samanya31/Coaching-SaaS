import { useState } from 'react';
import { BookOpen, Video } from 'lucide-react';
import { GlobalExamGoals } from './settings/GlobalExamGoals';
import { ZoomSettings } from './settings/ZoomSettings';

type TabType = 'goals' | 'zoom';

export const Settings = () => {
    const [activeTab, setActiveTab] = useState<TabType>('goals');

    const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
        { key: 'goals', label: 'Global Exam Goals', icon: BookOpen },
        { key: 'zoom', label: 'Zoom Integration', icon: Video },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                <p className="text-gray-500">Manage global platform configurations shared across all coaching institutes</p>
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
                {activeTab === 'goals' && <GlobalExamGoals />}
                {activeTab === 'zoom' && <ZoomSettings />}
            </div>
        </div>
    );
};

