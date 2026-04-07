import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { 
    getStats, 
    getRecentActivities,
    getUserGrowth,
    getPaymentMethods,
    getPackagePopularity
} from '../api/controllers/statsController';
import type { Stats, Activity } from '../types';

export const useStats = () => {
    return useQuery<Stats>({
        queryKey: queryKeys.stats,
        queryFn: getStats,
    });
};

export const useActivities = () => {
    return useQuery<Activity[]>({
        queryKey: queryKeys.activities,
        queryFn: getRecentActivities,
    });
};

export const useUserGrowth = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') => {
    return useQuery({
        queryKey: ['user-growth', period],
        queryFn: () => getUserGrowth(period),
    });
};

export const usePaymentMethods = () => {
    return useQuery({
        queryKey: ['payment-methods'],
        queryFn: getPaymentMethods,
    });
};

export const usePackagePopularity = () => {
    return useQuery({
        queryKey: ['package-popularity'],
        queryFn: getPackagePopularity,
    });
};

// Combined hook for dashboard
export const useDashboardData = () => {
    const statsQuery = useStats();
    const activitiesQuery = useActivities();

    return {
        stats: statsQuery.data,
        activities: activitiesQuery.data ?? [],
        isLoading: statsQuery.isLoading || activitiesQuery.isLoading,
        isError: statsQuery.isError || activitiesQuery.isError,
        refetch: () => {
            statsQuery.refetch();
            activitiesQuery.refetch();
        },
    };
};
