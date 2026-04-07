import api from '../api';

export const getFinanceSummary = async () => {
    const response = await api.get('/finance/summary');
    return response.data;
};

export const getRevenueBreakdown = async () => {
    const response = await api.get('/finance/breakdown');
    return response.data;
};

export const getRevenueTrends = async (period: string = '30d') => {
    const response = await api.get(`/finance/trends?period=${period}`);
    return response.data;
};

export const getFinanceLogs = async (params: { 
    status?: string, 
    method?: string, 
    startDate?: string, 
    endDate?: string 
}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.method) query.append('method', params.method);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    const response = await api.get(`/finance/logs?${query.toString()}`);
    return response.data;
};
