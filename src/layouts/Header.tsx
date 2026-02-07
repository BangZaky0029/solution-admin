import { FC, useState, useEffect } from 'react';
import { logout } from '../utils/auth';
import type { Notification } from '../types';

const Header: FC = () => {
    const [time, setTime] = useState<Date>(new Date());
    const [showNotifications, setShowNotifications] = useState<boolean>(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = (): void => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    const notifications: Notification[] = [
        { id: 1, text: 'New payment confirmation', time: '5 min ago', type: 'payment' },
        { id: 2, text: 'User registered', time: '10 min ago', type: 'user' },
        { id: 3, text: 'Package activated', time: '15 min ago', type: 'package' },
    ];

    return (
        <header className="relative bg-white/80 backdrop-blur-xl shadow-lg px-6 py-4 border-b border-gray-200/50">
            {/* Decorative gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

            <div className="flex items-center justify-between">
                {/* Left Section - Title & Breadcrumb */}
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3 shadow-lg hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Gateway APTO
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 font-bold">Admin Dashboard</span>
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            All systems operational
                        </p>
                    </div>
                </div>

                {/* Right Section - Time, Notifications, Profile, Logout */}
                <div className="flex items-center gap-4">
                    {/* Live Clock */}
                    <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl px-4 py-2 border border-purple-100">
                        <div className="text-2xl">🕐</div>
                        <div>
                            <p className="text-xs text-gray-600 font-semibold">Current Time</p>
                            <p className="text-sm font-bold text-gray-800 tabular-nums">
                                {time.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border border-orange-200 rounded-xl p-3 transition-all duration-300 hover:scale-110 group"
                        >
                            <span className="text-2xl">🔔</span>
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slide-down">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <span>🔔</span>
                                        Notifications
                                    </h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`
                          w-2 h-2 rounded-full mt-2 flex-shrink-0
                          ${notif.type === 'payment' ? 'bg-green-400' : ''}
                          ${notif.type === 'user' ? 'bg-blue-400' : ''}
                          ${notif.type === 'package' ? 'bg-purple-400' : ''}
                        `}></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-800">{notif.text}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-gray-50 text-center">
                                    <button className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                                        View All Notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-4 py-2 border border-purple-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-800">Admin User</p>
                            <p className="text-xs text-gray-600">Administrator</p>
                        </div>

                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                            <div className="relative w-11 h-11 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                A
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="group relative bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-2">
                            <span className="text-lg">🚪</span>
                            <span className="hidden sm:inline">Logout</span>
                        </span>
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
        </header>
    );
};

export default Header;
