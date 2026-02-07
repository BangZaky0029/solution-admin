import { FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '../../stores/uiStore';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

const typeConfig: Record<Notification['type'], { icon: string; gradient: string }> = {
    success: { icon: '✅', gradient: 'from-green-500 to-emerald-600' },
    error: { icon: '❌', gradient: 'from-red-500 to-pink-600' },
    warning: { icon: '⚠️', gradient: 'from-yellow-500 to-orange-500' },
    info: { icon: 'ℹ️', gradient: 'from-blue-500 to-purple-600' },
};

const ToastItem: FC<{ notification: Notification; onClose: () => void }> = ({
    notification,
    onClose,
}) => {
    const config = typeConfig[notification.type];
    const duration = notification.duration ?? 5000;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div
            className={`
        relative overflow-hidden bg-white rounded-2xl shadow-2xl
        border border-gray-100 animate-slide-in max-w-sm w-full
      `}
        >
            {/* Progress bar */}
            <div
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.gradient}`}
                style={{
                    animation: `shrink ${duration}ms linear forwards`,
                }}
            />

            <div className="flex items-start gap-3 p-4">
                <div className={`bg-gradient-to-br ${config.gradient} rounded-xl p-2 text-white shadow-lg`}>
                    <span className="text-xl">{config.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{notification.title}</p>
                    {notification.message && (
                        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                    <span className="text-lg">✕</span>
                </button>
            </div>
        </div>
    );
};

const Toast: FC = () => {
    const { notifications, removeNotification } = useUIStore();

    if (notifications.length === 0) return null;

    return createPortal(
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
            {notifications.map((notification) => (
                <ToastItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>,
        document.body
    );
};

export default Toast;
