import { ReactNode, TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    icon?: ReactNode;
    error?: string;
    helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    label,
    icon,
    error,
    helperText,
    className = '',
    rows = 4,
    ...props
}, ref) => {
    return (
        <div className="group">
            {label && (
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    {icon && <span className="text-xl">{icon}</span>}
                    {label}
                </label>
            )}
            <div className="relative">
                <textarea
                    ref={ref}
                    rows={rows}
                    className={`
            w-full px-4 py-3 bg-gray-50 border-2 rounded-xl
            font-medium outline-none transition-all duration-300 resize-none
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-200'
                            : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200'
                        }
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <span>⚠️</span> {error}
                </p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
