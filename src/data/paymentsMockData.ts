
export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking';

export interface Payment {
    id: string;
    studentName: string;
    studentEmail: string;
    avatar: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    date: Date;
    method: PaymentMethod;
    transactionId: string;
    itemName: string; // Batch or Course name
}

export const payments: Payment[] = [
    {
        id: 'PAY-001',
        studentName: 'Rahul Kumar',
        studentEmail: 'rahul@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
        amount: 12999,
        currency: 'INR',
        status: 'success',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        method: 'UPI',
        transactionId: 'TXN123456789',
        itemName: 'NEET 2025 Complete Course'
    },
    {
        id: 'PAY-002',
        studentName: 'Priya Sharma',
        studentEmail: 'priya@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        amount: 4999,
        currency: 'INR',
        status: 'success',
        date: new Date(Date.now() - 1000 * 60 * 60 * 5),
        method: 'Credit Card',
        transactionId: 'TXN987654321',
        itemName: 'NEET Biology Crash Course'
    },
    {
        id: 'PAY-003',
        studentName: 'Amit Patel',
        studentEmail: 'amit@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
        amount: 14999,
        currency: 'INR',
        status: 'pending',
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        method: 'Net Banking',
        transactionId: 'TXN456123789',
        itemName: 'JEE Main & Advanced 2025'
    },
    {
        id: 'PAY-004',
        studentName: 'Sneha Gupta',
        studentEmail: 'sneha@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
        amount: 6999,
        currency: 'INR',
        status: 'failed',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        method: 'UPI',
        transactionId: 'TXN741852963',
        itemName: 'CBSE Class 12 Complete Course'
    },
    {
        id: 'PAY-005',
        studentName: 'Vikram Singh',
        studentEmail: 'vikram@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
        amount: 18999,
        currency: 'INR',
        status: 'refunded',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        method: 'Debit Card',
        transactionId: 'TXN369258147',
        itemName: 'UPSC Prelims 2025 Complete'
    },
    {
        id: 'PAY-006',
        studentName: 'Anjali Desai',
        studentEmail: 'anjali@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
        amount: 8999,
        currency: 'INR',
        status: 'success',
        date: new Date(Date.now() - 1000 * 60 * 60 * 3),
        method: 'UPI',
        transactionId: 'TXN159753456',
        itemName: 'SSC CGL 2025 Complete Course'
    }
];
