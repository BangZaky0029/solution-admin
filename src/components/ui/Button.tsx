import { FC, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
};

const Button: FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const isDisabled = disabled || loading;

    return (
        <button
            className={`
        relative overflow-hidden rounded-xl font-bold
        transition-all duration-300
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
            disabled={isDisabled}
            {...props}
        >
            <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        <span className="animate-spin text-lg">⏳</span>
                        <span>Loading...</span>
                    </>
                ) : (
                    <>
                        {icon && <span className="text-lg">{icon}</span>}
                        {children}
                    </>
                )}
            </span>
        </button>
    );
};

export default Button;
