export interface Payment {
    id: string;
    coaching_id: string;
    student_id: string;
    batch_id?: string | null;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    payment_method: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'cash';
    transaction_id?: string;
    description?: string;
    date: string;
    created_at: string;
    updated_at: string;

    // Joined data
    students?: {
        full_name: string;
        phone: string;
        email: string;
        avatar_url?: string;
    };
    batches?: {
        name: string;
    };
}

export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'students' | 'batches'>;
export type PaymentUpdate = Partial<PaymentInsert>;
