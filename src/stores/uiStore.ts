import { create } from 'zustand';

type ModalType = 'package' | 'payment' | 'user' | 'confirm' | null;

interface UIState {
    // Sidebar
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;

    isMobileSidebarOpen: boolean;
    toggleMobileSidebar: () => void;
    closeMobileSidebar: () => void;

    // Modal
    activeModal: ModalType;
    modalData: unknown;
    openModal: (modal: ModalType, data?: unknown) => void;
    closeModal: () => void;

    // Notifications  
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

export const useUIStore = create<UIState>((set) => ({
    // Sidebar state
    isSidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({
        isSidebarCollapsed: !state.isSidebarCollapsed
    })),

    // Mobile Sidebar state
    isMobileSidebarOpen: false,
    toggleMobileSidebar: () => set((state) => ({
        isMobileSidebarOpen: !state.isMobileSidebarOpen
    })),
    closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),

    // Modal state
    activeModal: null,
    modalData: null,
    openModal: (modal, data = null) => set({
        activeModal: modal,
        modalData: data
    }),
    closeModal: () => set({
        activeModal: null,
        modalData: null
    }),

    // Notifications state
    notifications: [],
    addNotification: (notification) => set((state) => ({
        notifications: [
            ...state.notifications,
            { ...notification, id: crypto.randomUUID() }
        ]
    })),
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
    })),
    clearNotifications: () => set({ notifications: [] }),
}));
