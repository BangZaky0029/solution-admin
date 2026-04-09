// ============================================
// User Types
// ============================================
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    is_verified: boolean;
    is_active?: boolean;
    package_name?: string;
    expired_at?: string;
    created_at: string;
    last_login_at?: string;
    login_count?: number;
}

export interface UserToken {
    id: number;
    package_name: string;
    activated_at: string;
    expired_at: string;
    is_active: boolean;
}

export interface UserDetail extends User {
    tokens: UserToken[];
    payments: Payment[];
}

// ============================================
// Package Types
// ============================================
export interface Package {
    id: number;
    name: string;
    price: number;
    duration_days: number;
    features: string[] | string;
    feature_ids?: number[];
    description?: string; // Legacy/Manual override
    created_at?: string;
}

export interface PackageFormData {
    name: string;
    price: string | number;
    duration_days: number;
    features: string;
    feature_ids: number[];
    description?: string; // Optional manual override
}

// ============================================
// Payment Types
// ============================================
export interface Payment {
    id: number;
    payment_id: string;
    email: string;
    phone: string;
    amount?: number;
    proof_image?: string;
    package_name?: string;
    status: 'pending' | 'confirmed' | 'rejected';
    created_at: string;
}

// ============================================
// Stats Types
// ============================================
export interface Stats {
    totalPayments: number;
    pendingPayments: number;
    confirmedPayments: number;
    totalUsers: number;
    verifiedUsers: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    totalRevenue: number;
}

export interface Activity {
    id?: number;
    user_name: string;
    type: string;
    amount: number;
    created_at: string;
}

// ============================================
// Notification Types
// ============================================
export interface Notification {
    id: number;
    text: string;
    time: string;
    type: 'payment' | 'user' | 'package';
}

// ============================================
// Navigation Types
// ============================================
export interface NavItem {
    path: string;
    label: string;
    icon: string;
    gradient: string;
}

// ============================================
// WhatsApp Types
// ============================================
export type WhatsAppStatus = 'idle' | 'qr' | 'ready' | 'disconnected' | 'error';

export interface WhatsAppStatusConfig {
    color: string;
    label: string;
    icon: string;
}

export interface SendMessageForm {
    phone: string;
    message: string;
}

export interface SendMessageResult {
    success: boolean;
    message: string;
    sentTo?: string;
}

// ============================================
// Component Props Types
// ============================================
export interface StatCardProps {
    icon: string;
    title: string;
    value: number | string;
    gradient: string;
    delay?: string;
}

export interface QuickActionCardProps {
    href: string;
    icon: string;
    title: string;
    description: string;
    color?: string;
}

export interface PackageCardProps {
    pkg: Package;
    index: number;
}
