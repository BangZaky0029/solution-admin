import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
    getPackages,
    getPackage,
    createPackage,
    updatePackage,
    deletePackage,
    CreatePackagePayload
} from '../api/controllers/packageController';
import type { Package } from '../types';

export const usePackages = () => {
    return useQuery<Package[]>({
        queryKey: queryKeys.packages,
        queryFn: getPackages,
    });
};

export const usePackage = (id: number | null) => {
    return useQuery<Package>({
        queryKey: ['packages', id],
        queryFn: () => getPackage(id!),
        enabled: !!id,
    });
};

export const useCreatePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePackagePayload) => createPackage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.packages });
        },
    });
};

export const useUpdatePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { id: number } & CreatePackagePayload) =>
            updatePackage(payload.id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.packages });
        },
    });
};

export const useDeletePackage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deletePackage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.packages });
        },
    });
};
