import { FC, ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple';

interface BadgeProps {
    variant?: BadgeVariant;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-100 text-purple-700',
};

const Badge: FC<BadgeProps> = ({
    variant = 'default',
    icon,
    children,
    className = '',
}) => {
    return (
        <span
            className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
        ${variantStyles[variant]}
        ${className}
      `}
        >
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
