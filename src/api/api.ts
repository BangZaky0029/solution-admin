import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getToken, removeToken } from '../utils/auth';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError): Promise<never> => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => response,
    (error: AxiosError): Promise<never> => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear and redirect
            removeToken();

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
