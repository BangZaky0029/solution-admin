import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../utils/auth';
import type { NavItem } from '../types';
import { useUIStore } from '../stores/uiStore';

interface NavGroup {
    title: string;
    items: NavItem[];
}

const Sidebar: FC = () => {
    const location = useLocation();
    const { isMobileSidebarOpen, closeMobileSidebar } = useUIStore();

    const navGroups: NavGroup[] = [
        {
            title: 'UTAMA',
            items: [
                { path: '/', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-indigo-600' },
            ]
        },
        {
            title: 'MANAJEMEN USER',
            items: [
                { path: '/users', label: 'Users', icon: '👥', gradient: 'from-purple-500 to-fuchsia-600' },
                { path: '/otps', label: 'OTP Management', icon: '🔑', gradient: 'from-rose-500 to-orange-600' },
            ]
        },
        {
            title: 'BISNIS & LAYANAN',
            items: [
                { path: '/packages', label: 'Packages', icon: '📦', gradient: 'from-green-500 to-emerald-600' },
                { path: '/payments', label: 'Payments', icon: '💳', gradient: 'from-amber-500 to-orange-600' },
                { path: '/finance', label: 'Finance', icon: '💰', gradient: 'from-emerald-500 to-teal-600' },
            ]
        },
        {
            title: 'ANALITIK & TOOLS',
            items: [
                { path: '/insights', label: 'User Insights', icon: '💡', gradient: 'from-indigo-500 to-purple-600' },
                { path: '/whatsapp', label: 'WhatsApp Bot', icon: '💬', gradient: 'from-green-400 to-emerald-500' },
            ]
        }
    ];

    const handleLogout = (): void => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[9998] md:hidden backdrop-blur-md transition-opacity duration-300"
                    onClick={closeMobileSidebar}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-[9999] w-72 bg-[#0f172a] text-white flex flex-col overflow-hidden transition-all duration-300 ease-in-out shadow-2xl border-r border-white/5
                md:relative md:translate-x-0
                ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600 rounded-full blur-[100px]"></div>
                    <div className="absolute top-1/2 -right-24 w-64 h-64 bg-blue-600 rounded-full blur-[100px]"></div>
                </div>

                {/* Logo Section */}
                <div className="relative p-7 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
                            <div className="relative bg-[#1e293b] border border-white/10 rounded-2xl p-3 shadow-2xl">
                                <span className="text-3xl block transform group-hover:scale-110 group-hover:rotate-12 transition-transform">🚀</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter text-white leading-tight">
                                Gateway <span className="text-blue-400">APTO</span>
                            </h2>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mt-1">
                                Control Panel
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={closeMobileSidebar}
                        className="md:hidden text-gray-500 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
                    >
                        <span className="text-2xl">✕</span>
                    </button>
                </div>

                {/* Navigation Scrollable Area */}
                <nav className="relative flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                    {navGroups.map((group, groupIdx) => (
                        <div key={group.title} className="space-y-3">
                            <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-500 px-4">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={closeMobileSidebar}
                                            className="group relative block"
                                        >
                                            <div className={`
                                                relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
                                                ${isActive
                                                    ? 'bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-md'
                                                    : 'hover:bg-white/5'
                                                }
                                            `}>
                                                {/* Icon */}
                                                <div className={`
                                                    relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                                                    ${isActive
                                                        ? `bg-gradient-to-br ${item.gradient} shadow-lg scale-110`
                                                        : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-105'
                                                    }
                                                `}>
                                                    <span className={`text-xl ${isActive ? 'scale-110 shadow-sm' : ''}`}>{item.icon}</span>
                                                </div>

                                                {/* Label */}
                                                <span className={`
                                                    font-bold text-sm tracking-tight transition-colors
                                                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}
                                                `}>
                                                    {item.label}
                                                </span>

                                                {/* Active Indicator Arrow */}
                                                {isActive && (
                                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="relative p-6 mt-auto space-y-4 border-t border-white/5 bg-[#0f172a]/50 backdrop-blur-sm">
                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all duration-300"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-xl">🚪</span>
                        </div>
                        <span className="font-bold text-sm text-red-400/80 group-hover:text-red-400 transition-colors">
                            Sign Out
                        </span>
                    </button>

                    {/* Footer Info */}
                    <div className="text-center">
                        <p className="text-[10px] text-gray-600 font-medium">
                            NUANSA v2.1 • Built with ❤️
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
