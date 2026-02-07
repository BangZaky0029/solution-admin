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
