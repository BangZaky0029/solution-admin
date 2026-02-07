import { z } from 'zod';

// Package form validation schema
export const packageSchema = z.object({
    name: z.string()
        .min(3, 'Package name must be at least 3 characters')
        .max(50, 'Package name must be less than 50 characters'),
    price: z.number()
        .min(1000, 'Price must be at least 1000')
        .max(100000000, 'Price is too high'),
    duration_days: z.number()
        .min(1, 'Duration must be at least 1 day')
        .max(365, 'Duration cannot exceed 365 days'),
    features: z.string().optional(),
    feature_ids: z.array(z.number()).min(1, 'Select at least one feature'),
});

export type PackageFormData = z.infer<typeof packageSchema>;

// Login form validation schema
export const loginSchema = z.object({
    email: z.string()
        .email('Invalid email address'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Payment activation schema
export const activatePaymentSchema = z.object({
    payment_id: z.string().min(1, 'Payment ID is required'),
});

export type ActivatePaymentData = z.infer<typeof activatePaymentSchema>;
