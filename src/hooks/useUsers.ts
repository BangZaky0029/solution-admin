import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { getUsers, getUserById } from '../api/controllers/userController';
import type { User } from '../types';

interface UsersResponse {
    data: User[];
    success: boolean;
}

export const useUsers = () => {
    return useQuery<UsersResponse>({
        queryKey: queryKeys.users,
        queryFn: getUsers,
        select: (data) => data, // Return full response
    });
};

export const useUser = (id: number) => {
    return useQuery<User>({
        queryKey: queryKeys.user(id),
        queryFn: () => getUserById(id),
        enabled: !!id,
    });
};
