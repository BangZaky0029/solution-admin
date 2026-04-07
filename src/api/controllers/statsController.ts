import api from '../api';
import type { Stats, Activity } from '../../types';

export const getStats = async (): Promise<Stats> => {
    const response = await api.get<Stats>('/stats');
    return response.data;
};

export const getMonthlyStats = async (): Promise<Stats> => {
    const response = await api.get<Stats>('/stats/monthly');
    return response.data;
};

export const getRecentActivities = async (): Promise<Activity[]> => {
    const response = await api.get<Activity[]>('/stats/activities');
    return response.data;
};

export const getUserGrowth = async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily'): Promise<{ label: string; count: number }[]> => {
    const response = await api.get<{ label: string; count: number }[]>(`/stats/user-growth?period=${period}`);
    return response.data;
};

export const getPaymentMethods = async (): Promise<{ name: string; value: number }[]> => {
    const response = await api.get<{ name: string; value: number }[]>('/stats/payment-methods');
    return response.data;
};

export const getPackagePopularity = async (): Promise<{ name: string; count: number }[]> => {
    const response = await api.get<{ name: string; count: number }[]>('/stats/package-popularity');
    return response.data;
};
