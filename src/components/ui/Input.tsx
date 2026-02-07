import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: ReactNode;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    icon,
    error,
    helperText,
    className = '',
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
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-3 bg-gray-50 border-2 rounded-xl
            font-medium outline-none transition-all duration-300
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-200'
                            : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200'
                        }
            ${className}
          `}
                    {...props}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 transition-opacity -z-10 blur-xl pointer-events-none" />
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

Input.displayName = 'Input';

export default Input;
