
export interface IDCardTemplate {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    accentColor: string;
    borderStyle: 'rounded' | 'sharp' | 'extra-rounded';
    backgroundPattern: 'circles' | 'gradient' | 'lines' | 'dots';
}

export const idCardTemplates: IDCardTemplate[] = [
    {
        id: 'template-premium',
        name: 'Premium Corporate',
        primaryColor: 'from-[#0f3c73] via-[#1456a1] to-[#1e6fd9]',
        secondaryColor: 'blue',
        textColor: 'text-white',
        accentColor: 'blue-100',
        borderStyle: 'rounded',
        backgroundPattern: 'gradient'
    },
    {
        id: 'template-1',
        name: 'Professional Blue',
        primaryColor: 'from-indigo-600 to-indigo-800',
        secondaryColor: 'indigo',
        textColor: 'text-white',
        accentColor: 'indigo-100',
        borderStyle: 'rounded',
        backgroundPattern: 'circles'
    },
    {
        id: 'template-2',
        name: 'Modern Purple',
        primaryColor: 'from-purple-600 to-pink-600',
        secondaryColor: 'purple',
        textColor: 'text-white',
        accentColor: 'purple-100',
        borderStyle: 'extra-rounded',
        backgroundPattern: 'gradient'
    },
    {
        id: 'template-3',
        name: 'Corporate Green',
        primaryColor: 'from-emerald-600 to-teal-700',
        secondaryColor: 'emerald',
        textColor: 'text-white',
        accentColor: 'emerald-100',
        borderStyle: 'sharp',
        backgroundPattern: 'lines'
    },
    {
        id: 'template-4',
        name: 'Elegant Dark',
        primaryColor: 'from-gray-800 to-gray-900',
        secondaryColor: 'gray',
        textColor: 'text-white',
        accentColor: 'gray-200',
        borderStyle: 'rounded',
        backgroundPattern: 'dots'
    },
    {
        id: 'template-5',
        name: 'Vibrant Orange',
        primaryColor: 'from-orange-500 to-red-600',
        secondaryColor: 'orange',
        textColor: 'text-white',
        accentColor: 'orange-100',
        borderStyle: 'extra-rounded',
        backgroundPattern: 'circles'
    }
];
