import api from '../api';
import type { User } from '../../types';

interface UsersResponse {
    success: boolean;
    data: User[];
}

interface UserResponse {
    success: boolean;
    data: User;
}

export const getUsers = async (): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>('/users');
    return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
    const response = await api.get<UserResponse>(`/users/${id}`);
    return response.data.data;
};
