import { FC, ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    gradient?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    gradient?: string;
}

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

const CardHeader: FC<CardHeaderProps> = ({ icon, title, subtitle, gradient }) => (
    <div className={`flex items-center gap-4 ${gradient ? `bg-gradient-to-r ${gradient} p-6 -m-6 mb-6` : ''}`}>
        {icon && (
            <div className={`${gradient ? 'bg-white/20' : 'bg-gray-100'} backdrop-blur-sm rounded-xl p-3`}>
                <span className="text-3xl">{icon}</span>
            </div>
        )}
        <div>
            <h2 className={`text-xl font-black ${gradient ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
            {subtitle && (
                <p className={`text-sm font-medium mt-1 ${gradient ? 'text-white/80' : 'text-gray-600'}`}>
                    {subtitle}
                </p>
            )}
        </div>
    </div>
);

interface CardComponent extends FC<CardProps> {
    Header: typeof CardHeader;
}

const Card: CardComponent = Object.assign(
    (props: CardProps) => {
        const { children, className = '', gradient, hover = false, padding = 'md' } = props;
        return (
            <div
                className={`
          relative overflow-hidden rounded-2xl shadow-xl
          ${gradient ? `bg-gradient-to-br ${gradient}` : 'bg-white border border-gray-100'}
          ${hover ? 'transition-all duration-300 hover:scale-105 hover:shadow-2xl' : ''}
          ${paddingStyles[padding]}
          ${className}
        `}
            >
                {children}
            </div>
        );
    },
    { Header: CardHeader }
);

export default Card;
