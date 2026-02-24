export interface ImageTemplateConfig {
    id: string;
    name: string;
    frontImageUrl: string;
    backImageUrl: string;

    // Position configurations (in pixels or percentage)
    photo: {
        x: number;
        y: number;
        width: number;
        height: number;
        borderRadius?: number;
    };

    studentName: {
        x: number;
        y: number;
        fontSize: number;
        color: string;
        fontWeight?: number;
        maxWidth?: number;
    };

    studentId: {
        x: number;
        y: number;
        fontSize: number;
        color: string;
    };

    examGoal: {
        x: number;
        y: number;
        fontSize: number;
        color: string;
    };

    validUntil?: {
        x: number;
        y: number;
        fontSize: number;
        color: string;
    };

    // Back side positions
    back?: {
        email?: { x: number; y: number; fontSize: number; color: string; };
        phone?: { x: number; y: number; fontSize: number; color: string; };
        enrollmentDate?: { x: number; y: number; fontSize: number; color: string; };
        qrCode?: { x: number; y: number; size: number; };
    };
}

export const imageTemplateConfigs: ImageTemplateConfig[] = [
    {
        id: 'custom-template-1',
        name: 'Custom Blue Template',
        frontImageUrl: '/templates/id-card-front.png',  // Your template image path
        backImageUrl: '/templates/id-card-back.png',

        // Adjust these coordinates to match your template
        photo: {
            x: 30,
            y: 60,
            width: 90,
            height: 110,
            borderRadius: 8
        },


        studentName: {
            x: 140,
            y: 80,
            fontSize: 18,
            color: '#000000',
            fontWeight: 700,
            maxWidth: 200
        },

        studentId: {
            x: 140,
            y: 110,
            fontSize: 14,
            color: '#333333'
        },

        examGoal: {
            x: 140,
            y: 140,
            fontSize: 14,
            color: '#666666'
        },

        validUntil: {
            x: 30,
            y: 220,
            fontSize: 12,
            color: '#ffffff'
        },

        back: {
            email: { x: 50, y: 80, fontSize: 12, color: '#333333' },
            phone: { x: 50, y: 110, fontSize: 12, color: '#333333' },
            enrollmentDate: { x: 50, y: 140, fontSize: 12, color: '#333333' },
            qrCode: { x: 280, y: 80, size: 80 }
        }
    }
];
