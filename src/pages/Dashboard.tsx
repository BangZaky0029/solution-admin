import { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    useStats, 
    useActivities as useRecentActivities, 
    useUserGrowth, 
    usePaymentMethods, 
    usePackagePopularity 
} from '../hooks/useStats';
import { LoadingSpinner, Badge } from '../components/ui';
import type { StatCardProps, QuickActionCardProps, Activity } from '../types';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [growthPeriod, setGrowthPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

    // React Query hooks
    const { data: stats, isLoading: statsLoading } = useStats();
    const { data: activities = [] } = useRecentActivities();
    const { data: userGrowth = [], isLoading: growthLoading } = useUserGrowth(growthPeriod);
    const { data: paymentMethods = [] } = usePaymentMethods();
    const { data: packagePopularity = [] } = usePackagePopularity();

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

    if (statsLoading && growthLoading) {
        return <LoadingSpinner size="lg" text="Loading dashboard analytics..." icon="📊" />;
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in mb-10">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-6 md:p-10 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-5 transform -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                        <span className="text-4xl md:text-6xl animate-wave origin-bottom-right">👋</span>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-white mb-2">
                                {greeting}, Admin!
                            </h1>
                            <p className="text-purple-200 text-sm md:text-lg font-medium">
                                Welcome back to Gateway APTO Control Center
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white flex items-center gap-2">
                            <span className="text-xl">📅</span>
                            <span className="font-medium text-sm md:text-base">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

            {/* Growth Analytics Chart (LineChart/AreaChart) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-3">
                            <span className="text-2xl">📈</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">User Growth Analytics</h2>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setGrowthPeriod(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    growthPeriod === p 
                                    ? 'bg-white text-purple-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[300px] md:h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowth}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="label" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6B7280', fontSize: 12}}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6B7280', fontSize: 12}}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#8884d8" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods (PieChart) */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-3">
                            <span className="text-2xl">💳</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Payment Methods Distribution</h2>
                    </div>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentMethods}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationDuration={1000}
                                >
                                    {paymentMethods.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Package Popularity (BarChart) */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-3">
                            <span className="text-2xl">📦</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Package Popularity</h2>
                    </div>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={packagePopularity} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fontWeight: 'bold'}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar 
                                    dataKey="count" 
                                    fill="#ffc658" 
                                    radius={[0, 10, 10, 0]}
                                    barSize={30}
                                    animationDuration={1200}
                                >
                                    {packagePopularity.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Actions (moved lower if needed, or kept here) */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-3">
                        <span className="text-2xl md:text-3xl">⚡</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Quick Actions</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-3">
                            <span className="text-2xl">🕒</span>
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

