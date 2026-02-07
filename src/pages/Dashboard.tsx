import { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStats, useActivities as useRecentActivities } from '../hooks/useStats';
import { LoadingSpinner, Badge } from '../components/ui';
import type { StatCardProps, QuickActionCardProps, Activity } from '../types';

const Dashboard = () => {
    // React Query hooks
    const { data: stats, isLoading: statsLoading } = useStats();
    const { data: activities = [] } = useRecentActivities();

    // Greeting based on time
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const StatCard: FC<StatCardProps> = ({ icon, title, value, gradient, delay }) => (
        <div
            className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${gradient}`}
            style={{ animationDelay: delay }}
        >
            <div className="absolute inset-0 opacity-90" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-4xl">{icon}</span>
                    </div>
                </div>

                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
                    <p className="text-4xl font-bold mb-2">
                        {statsLoading ? (
                            <span className="animate-pulse">...</span>
                        ) : (
                            <span className="tabular-nums">{value}</span>
                        )}
                    </p>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                        <span>●</span>
                        <span>Live Data</span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
        </div>
    );

    const QuickActionCard: FC<QuickActionCardProps> = ({ href, icon, title, description }) => (
        <Link
            to={href}
            className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-transparent hover:-translate-y-1"
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

            <div className="relative flex items-start gap-4">
                <div className="bg-opacity-10 rounded-xl p-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl">{icon}</span>
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-purple-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>

                <div className="text-2xl text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300">
                    →
                </div>
            </div>
        </Link>
    );

    if (statsLoading) {
        return <LoadingSpinner size="lg" text="Loading dashboard..." icon="📊" />;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-10 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-5 transform -translate-x-1/2 translate-y-1/2" />

                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full opacity-20"
                        style={{
                            width: Math.random() * 8 + 4 + 'px',
                            height: Math.random() * 8 + 4 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animation: 'float 6s linear infinite',
                            animationDelay: Math.random() * 3 + 's',
                        }}
                    />
                ))}

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-6xl animate-wave">👋</span>
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">
                                {greeting}, Admin!
                            </h1>
                            <p className="text-purple-200 text-lg font-medium">
                                Welcome back to Gateway APTO Control Center
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white flex items-center gap-2">
                            <span className="text-xl">📅</span>
                            <span className="font-medium">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <Badge variant="success" icon="⏰">
                            {new Date().toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon="💳"
                    title="Total Payments"
                    value={stats?.totalPayments ?? 0}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                    delay="0s"
                />
                <StatCard
                    icon="⏳"
                    title="Pending Payments"
                    value={stats?.pendingPayments ?? 0}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                    delay="0.1s"
                />
                <StatCard
                    icon="✅"
                    title="Confirmed"
                    value={stats?.confirmedPayments ?? 0}
                    gradient="bg-gradient-to-br from-emerald-500 to-green-700"
                    delay="0.2s"
                />
                <StatCard
                    icon="👥"
                    title="Total Users"
                    value={stats?.totalUsers ?? 0}
                    gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                    delay="0.3s"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-3">
                        <span className="text-3xl">⚡</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuickActionCard
                        href="/payments"
                        icon="👁️"
                        title="View Payments"
                        description="Manage pending confirmations"
                    />
                    <QuickActionCard
                        href="/packages"
                        icon="📦"
                        title="Manage Packages"
                        description="Create and edit packages"
                    />
                    <QuickActionCard
                        href="/users"
                        icon="👤"
                        title="View Users"
                        description="Manage user accounts"
                    />
                </div>
            </div>

            {/* Activity & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-3">
                            <span className="text-2xl">📊</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                    </div>

                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity: Activity, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-bold text-gray-800">{activity.user_name}</p>
                                        <p className="text-sm text-gray-500">{activity.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">+{activity.amount}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(activity.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 mb-4">
                                    <span className="text-6xl">📭</span>
                                </div>
                                <p className="text-gray-600 font-medium">No recent activity</p>
                                <p className="text-sm text-gray-400 mt-2">Activity will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3">
                            <span className="text-2xl">🖥️</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">System Status</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'API Server', status: 'Operational' },
                            { label: 'Database', status: 'Operational' },
                            { label: 'Payment Gateway', status: 'Operational' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full animate-pulse bg-green-500" />
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                </div>
                                <Badge variant="success">{item.status}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
