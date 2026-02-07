import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 30 seconds
            staleTime: 30 * 1000,

            // Cache is garbage collected after 5 minutes
            gcTime: 5 * 60 * 1000,

            // Retry failed requests up to 2 times
            retry: 2,

            // Don't refetch on window focus in admin panel
            refetchOnWindowFocus: false,

            // Refetch on reconnect
            refetchOnReconnect: true,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

// Query keys for type-safe invalidation
export const queryKeys = {
    // Stats
    stats: ['stats'] as const,
    monthlyStats: ['stats', 'monthly'] as const,
    activities: ['activities'] as const,

    // Payments
    payments: ['payments'] as const,
    payment: (id: string) => ['payments', id] as const,

    // Packages
    packages: ['packages'] as const,
    package: (id: number) => ['packages', id] as const,

    // Users
    users: ['users'] as const,
    user: (id: number) => ['users', id] as const,
} as const;
