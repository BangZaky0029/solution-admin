import Cookies from 'js-cookie';

// ============================================
// Cookie Configuration
// ============================================
const TOKEN_KEY = 'admin_token';
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 1, // 1 day
    secure: window.location.protocol === 'https:', // Secure in production
    sameSite: 'strict',
    path: '/',
};

// ============================================
// Token Management Functions
// ============================================

/**
 * Store authentication token securely in cookie
 */
export const setToken = (token: string): void => {
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
};

/**
 * Retrieve authentication token from cookie
 */
export const getToken = (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
};

/**
 * Remove authentication token from cookie
 */
export const removeToken = (): void => {
    Cookies.remove(TOKEN_KEY, { path: '/' });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token && token.length > 0;
};

// ============================================
// Auth Helper Functions
// ============================================

/**
 * Handle logout - clear token and redirect
 */
export const logout = (): void => {
    removeToken();
    window.location.href = '/login';
};

/**
 * Validate token format (basic check)
 */
export const isValidTokenFormat = (token: string): boolean => {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
};
