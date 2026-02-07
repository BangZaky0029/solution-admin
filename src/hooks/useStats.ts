import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { getStats, getRecentActivities } from '../api/controllers/statsController';
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
