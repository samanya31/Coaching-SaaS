import { supabase } from '@/config/supabase';
import { Payment, PaymentInsert, PaymentUpdate } from '@/types/payment';

export const paymentService = {
    /**
     * Get all payments for a coaching institute
     */
    getPayments: async (coachingId: string): Promise<Payment[]> => {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                students:users (
                    full_name,
                    phone,
                    email,
                    avatar_url
                ),
                batches (
                    name
                )
            `)
            .eq('coaching_id', coachingId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data as Payment[];
    },

    /**
     * Get payments for a specific student
     */
    getStudentPayments: async (studentId: string): Promise<Payment[]> => {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                batches (
                    name
                )
            `)
            .eq('student_id', studentId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data as Payment[];
    },

    /**
     * Create a new payment record
     */
    createPayment: async (payment: PaymentInsert): Promise<Payment> => {
        const { data, error } = await supabase
            .from('payments')
            .insert([payment])
            .select()
            .single();

        if (error) throw error;
        return data as Payment;
    },

    /**
     * Update payment status
     */
    updatePaymentStatus: async (id: string, status: Payment['status']): Promise<Payment> => {
        const { data, error } = await supabase
            .from('payments')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Payment;
    }
};
