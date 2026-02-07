import api from '../api';
import type { Payment } from '../../types';

interface PaymentsResponse {
    success: boolean;
    data: Payment[];
}

interface ActivatePaymentPayload {
    payment_id: string;
}

interface ActivatePaymentResponse {
    success: boolean;
    data: Payment;
    message: string;
}

export const getPayments = async (): Promise<Payment[]> => {
    const response = await api.get<PaymentsResponse>('/admin/payments');
    return response.data.data;
};

export const activatePayment = async (data: ActivatePaymentPayload): Promise<Payment> => {
    const response = await api.post<ActivatePaymentResponse>('/admin/activate', data);
    return response.data.data;
};
