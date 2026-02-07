import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

export interface Feature {
    id: number;
    name: string;
    code: string;
    status: 'free' | 'premium';
}

export const useFeatures = () => {
    return useQuery({
        queryKey: ['features'],
        queryFn: async () => {
            const { data } = await api.get<Feature[]>('/feature');
            return data;
        },
    });
};
