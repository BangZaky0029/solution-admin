import api from '../api';
import type { User, UserDetail } from '../../types';

interface UsersResponse {
    success: boolean;
    data: User[];
}

interface UserDetailResponse {
    success: boolean;
    data: UserDetail;
}

export const getUsers = async (): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>('/users');
    return response.data;
};

export const getUserById = async (id: number): Promise<UserDetail> => {
    const response = await api.get<UserDetailResponse>(`/users/${id}`);
    return response.data.data;
};
