// ============================================
// Generic API Response Wrapper
// ============================================
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

// ============================================
// Auth Types
// ============================================
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user?: {
        id: number;
        email: string;
        name: string;
    };
}

// ============================================
// Specific API Responses
// ============================================
export interface PaymentsResponse {
    success: boolean;
    data: import('./index').Payment[];
}

export interface UsersResponse {
    success: boolean;
    data: import('./index').User[];
}

export interface StatsResponse {
    totalPayments: number;
    pendingPayments: number;
    confirmedPayments: number;
    totalUsers: number;
    activeSubscriptions: number;
    totalRevenue: number;
}

export interface ActivitiesResponse {
    data: import('./index').Activity[];
}
