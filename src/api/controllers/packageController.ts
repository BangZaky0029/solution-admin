import api from '../api';
import type { Package } from '../../types';

export interface CreatePackagePayload {
    name: string;
    price: number;
    duration_days: number;
    features: string[];
}

export const getPackages = async (): Promise<Package[]> => {
    const response = await api.get<Package[]>('/packages');
    return response.data;
};

export const createPackage = async (data: CreatePackagePayload): Promise<Package> => {
    const response = await api.post<Package>('/packages', data);
    return response.data;
};

export const updatePackage = async (id: number, data: CreatePackagePayload): Promise<Package> => {
    const response = await api.put<Package>(`/packages/${id}`, data);
    return response.data;
};

export const deletePackage = async (id: number): Promise<void> => {
    await api.delete(`/packages/${id}`);
};
