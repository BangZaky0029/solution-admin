import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'admin_token';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;

    // Actions
    login: (token: string) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            token: null,

            login: (token: string) => {
                // Store in secure cookie
                Cookies.set(TOKEN_KEY, token, {
                    expires: 1,
                    secure: window.location.protocol === 'https:',
                    sameSite: 'strict',
                    path: '/',
                });

                set({ isAuthenticated: true, token });
            },

            logout: () => {
                Cookies.remove(TOKEN_KEY, { path: '/' });
                set({ isAuthenticated: false, token: null });
                window.location.href = '/login';
            },

            checkAuth: () => {
                const token = Cookies.get(TOKEN_KEY);
                set({
                    isAuthenticated: !!token,
                    token: token || null
                });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
        }
    )
);

// Helper function for components
export const getToken = (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
};
