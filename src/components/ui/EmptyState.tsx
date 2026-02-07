import { FC, ReactNode } from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: ReactNode;
}

const EmptyState: FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    description,
    action,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 mb-6">
                <span className="text-8xl">{icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-600 mb-6 max-w-md">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default EmptyState;
