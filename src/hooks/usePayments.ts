import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { getPayments, activatePayment } from '../api/controllers/paymentController';
import type { Payment } from '../types';

export const usePayments = () => {
    return useQuery<Payment[]>({
        queryKey: queryKeys.payments,
        queryFn: getPayments,
    });
};

export const useActivatePayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { payment_id: string }) => activatePayment(data),
        onSuccess: () => {
            // Invalidate payments query to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.payments });
            // Also invalidate stats as they might change
            queryClient.invalidateQueries({ queryKey: queryKeys.stats });
        },
    });
};
