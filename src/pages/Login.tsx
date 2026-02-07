import { FC, useState, FormEvent } from 'react';
import api from '../api/api';
import { setToken } from '../utils/auth';

const Login: FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post<{ token: string }>('/admin/login', { email, password });
            setToken(res.data.token);
            window.location.href = '/';
        } catch (err) {
            console.error('Login failed:', err);
            alert('❌ Login failed! Please check your email and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full opacity-20"
                        style={{
                            width: Math.random() * 10 + 5 + 'px',
                            height: Math.random() * 10 + 5 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                            animationDelay: Math.random() * 5 + 's'
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo/Title Section */}
                <div className="text-center mb-8 animate-fade-in-down">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                        <div className="relative bg-white rounded-full p-6 shadow-2xl">
                            <span className="text-6xl">🚀</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-extrabold text-white mt-6 mb-3 tracking-tight">
                        Gateway <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">APTO</span>
                    </h1>
                    <p className="text-purple-200 text-lg font-medium">Admin Control Center</p>
                </div>

                {/* Login Card */}
                <div className="relative animate-fade-in-up">
                    {/* Glass effect background */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-3xl"></div>

                    {/* Card content */}
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                        {/* Decorative gradient line */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full"></div>

                        <form onSubmit={submit} className="space-y-6 mt-4">
                            {/* Email Input */}
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <span className="text-xl">📧</span>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none text-gray-800 font-medium"
                                        placeholder="admin@gatewayapto.com"
                                        required
                                        disabled={loading}
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-focus-within:opacity-20 transition-opacity -z-10 blur-xl"></div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <span className="text-xl">🔐</span>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none text-gray-800 font-medium pr-12"
                                        placeholder="Enter your password"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-focus-within:opacity-20 transition-opacity -z-10 blur-xl"></div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform relative overflow-hidden group ${loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:scale-105 hover:shadow-2xl'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <span className="animate-spin text-2xl">⏳</span>
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-2xl">🚀</span>
                                            Launch Dashboard
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Info Badge */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 border border-purple-100">
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl flex-shrink-0">🔒</span>
                                    <div>
                                        <p className="text-sm font-bold text-purple-900">Secure Admin Access</p>
                                        <p className="text-xs text-purple-700 mt-1">
                                            Protected with enterprise-grade encryption
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-200 rounded-full opacity-20"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 animate-fade-in">
                    <p className="text-purple-200 text-sm font-medium">
                        © 2026 Gateway APTO • Built with 💜
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 0.5; }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.2s both;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.4s both;
        }
      `}</style>
        </div>
    );
};

export default Login;
