import { FC } from 'react';

interface ErrorFallbackProps {
    error: Error | null;
    onReset?: () => void;
}

const ErrorFallback: FC<ErrorFallbackProps> = ({ error, onReset }) => {
    const handleGoHome = (): void => {
        window.location.href = '/';
    };

    const handleRefresh = (): void => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 p-6">
            <div className="max-w-lg w-full">
                {/* Error Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 text-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-5xl">⚠️</span>
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">Oops! Something Went Wrong</h1>
                        <p className="text-red-100 font-medium">An unexpected error occurred</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">🐛</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-red-800 mb-1">Error Details:</p>
                                        <p className="text-sm text-red-600 break-words font-mono">
                                            {error.message || 'Unknown error occurred'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Help Text */}
                        <div className="text-center text-gray-600">
                            <p className="text-sm">
                                Don't worry, this error has been logged. Please try the following:
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {onReset && (
                                <button
                                    onClick={onReset}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    <span>🔄</span>
                                    <span>Try Again</span>
                                </button>
                            )}

                            <button
                                onClick={handleRefresh}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                <span>🔃</span>
                                <span>Refresh</span>
                            </button>

                            <button
                                onClick={handleGoHome}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                <span>🏠</span>
                                <span>Go Home</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center">
                            If this problem persists, please contact the administrator.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback;
