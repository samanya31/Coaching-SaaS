import { supabase } from '@/config/supabase';
import { batchService } from './batch.service';
import { paymentService } from './payment.service';
import { leadService } from './lead.service';
import { Payment } from '@/types/payment';

export const enrollmentService = {
    /**
     * Enroll a student in a batch with payment
     */
    enrollStudent: async (
        coachingId: string,
        userId: string,
        batchId: string,
        amount: number,
        paymentDetails: {
            method: string;
            transactionId?: string;
        }
    ) => {
        try {
            // 1. Create Enrollment Record
            const enrollment = await batchService.enrollStudent(batchId, userId, coachingId);

            // 2. Create Payment Record
            const payment = await paymentService.createPayment({
                coaching_id: coachingId,
                student_id: userId,
                batch_id: batchId,
                amount: amount,
                status: 'completed',
                payment_method: paymentDetails.method as Payment['payment_method'],
                transaction_id: paymentDetails.transactionId || `TXN_${Date.now()}`,
                description: `Enrollment in batch: ${batchId}`,
                date: new Date().toISOString()
            });

            // 3. Check if user is a lead and update status
            // We need to know if this user corresponds to a lead.
            // Assuming we can find lead by phone or if userId is linked.
            // For now, let's try to update lead status if we can find one by user's phone.
            // Fetch user phone first
            const { data: user } = await supabase.from('users').select('phone').eq('id', userId).single();

            if (user?.phone) {
                // Find visible lead for this coaching and phone
                const { data: lead } = await supabase
                    .from('leads')
                    .select('id')
                    .eq('coaching_id', coachingId)
                    .eq('phone', user.phone)
                    .maybeSingle();

                if (lead) {
                    await leadService.updateLeadStatus(lead.id, 'converted');
                }
            }

            return { success: true, enrollment, payment };

        } catch (error) {
            console.error('Enrollment Flow Error:', error);
            throw error;
        }
    }
};
