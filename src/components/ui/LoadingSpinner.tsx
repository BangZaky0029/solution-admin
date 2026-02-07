import { FC } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
    size?: SpinnerSize;
    text?: string;
    icon?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
};

const iconSizes: Record<SpinnerSize, string> = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
};

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
    size = 'lg',
    text = 'Loading...',
    icon = '⚡',
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`relative ${sizeStyles[size]}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin opacity-75"></div>
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <span className={`${iconSizes[size]} animate-pulse`}>{icon}</span>
                </div>
            </div>
            {text && (
                <p className="mt-4 text-gray-600 font-semibold animate-pulse">{text}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
