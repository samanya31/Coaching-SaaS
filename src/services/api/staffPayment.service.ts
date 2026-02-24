import { supabase } from '@/config/supabase';

export interface StaffPayment {
    id: string;
    coaching_id: string;
    staff_id: string;
    amount: number;
    payment_date: string;
    payment_month?: string;
    status: 'pending' | 'completed' | 'failed';
    method?: 'cash' | 'upi' | 'bank_transfer' | 'cheque';
    reference_id?: string;
    remarks?: string;
    created_at: string;

    // Joined data
    staff?: {
        full_name: string;
        email: string;
        phone: string;
    };
}

export const staffPaymentService = {
    /**
     * Get payments for a specific staff member
     */
    async getPaymentsByStaff(staffId: string) {
        const { data, error } = await supabase
            .from('staff_payments')
            .select('*')
            .eq('staff_id', staffId)
            .order('payment_date', { ascending: false });

        if (error) {
            console.error('[staffPaymentService] Error fetching payments:', error);
            throw error;
        }

        return data as StaffPayment[];
    },

    /**
     * Get all staff payments for a coaching, optionally filtered by month
     */
    async getPayments(coachingId: string, month?: string) {
        let query = supabase
            .from('staff_payments')
            .select(`
                *,
                staff:users!staff_id(full_name, email, phone)
            `)
            .eq('coaching_id', coachingId)
            .order('payment_date', { ascending: false });

        if (month) {
            query = query.eq('payment_month', month);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[staffPaymentService] Error fetching all payments:', error);
            throw error;
        }

        return data as StaffPayment[];
    },

    /**
     * Create a new payment record
     */
    async createPayment(paymentData: Partial<StaffPayment>) {
        const { data, error } = await supabase
            .from('staff_payments')
            .insert([paymentData])
            .select()
            .single();

        if (error) {
            console.error('[staffPaymentService] Error creating payment:', error);
            throw error;
        }

        return data as StaffPayment;
    },

    /**
     * Update a payment record
     */
    async updatePayment(id: string, updates: Partial<StaffPayment>) {
        const { data, error } = await supabase
            .from('staff_payments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[staffPaymentService] Error updating payment:', error);
            throw error;
        }

        return data as StaffPayment;
    },

    /**
     * Delete a payment record
     */
    async deletePayment(id: string) {
        const { error } = await supabase
            .from('staff_payments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[staffPaymentService] Error deleting payment:', error);
            throw error;
        }
    }
};
