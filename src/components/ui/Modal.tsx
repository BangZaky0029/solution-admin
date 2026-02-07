import { FC, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

const Modal: FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    icon,
    children,
    size = 'md',
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className={`relative bg-white rounded-3xl w-full ${sizeStyles[size]} shadow-2xl animate-scale-in`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                {icon && <span className="text-3xl">{icon}</span>}
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-2 text-white transition-all duration-300 hover:scale-110"
                            >
                                <span className="text-2xl">✕</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className={title ? 'p-6' : 'p-6 pt-0'}>
                    {/* Close button if no title */}
                    {!title && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-xl p-2 text-gray-600 transition-all duration-300 hover:scale-110"
                        >
                            <span className="text-xl">✕</span>
                        </button>
                    )}
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
