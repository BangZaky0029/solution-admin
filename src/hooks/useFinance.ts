import { useQuery } from '@tanstack/react-query';
import * as financeApi from '../api/controllers/financeController';

export const useFinanceSummary = () => {
    return useQuery({
        queryKey: ['finance-summary'],
        queryFn: financeApi.getFinanceSummary,
        select: (data) => data.data,
    });
};

export const useFinanceBreakdown = () => {
    return useQuery({
        queryKey: ['finance-breakdown'],
        queryFn: financeApi.getRevenueBreakdown,
        select: (data) => data.data,
    });
};

export const useRevenueTrends = (period: string = '30d') => {
    return useQuery({
        queryKey: ['revenue-trends', period],
        queryFn: () => financeApi.getRevenueTrends(period),
        select: (data) => data.data,
    });
};

export const useFinanceLogs = (params: { 
    status?: string, 
    method?: string, 
    startDate?: string, 
    endDate?: string 
}) => {
    return useQuery({
        queryKey: ['finance-logs', params],
        queryFn: () => financeApi.getFinanceLogs(params),
        select: (data) => data.data,
    });
};
