import { FC, useEffect, useState, ChangeEvent } from 'react';
import { getUsers } from '../api/controllers/userController';
import type { User } from '../types';

interface UsersData {
    data: User[];
    success: boolean;
}

const Users: FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [search, setSearch] = useState<string>('');
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [search, filter, users]);

    const loadUsers = async (): Promise<void> => {
        try {
            const response = await getUsers() as UsersData;
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = (): void => {
        let result = [...users];

        // Apply status filter
        if (filter === 'verified') {
            result = result.filter(u => u.is_verified);
        } else if (filter === 'active') {
            result = result.filter(u => u.is_active);
        } else if (filter === 'expired') {
            result = result.filter(u => {
                if (!u.expired_at) return false;
                return new Date(u.expired_at) < new Date();
            });
        }

        // Apply search
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower) ||
                u.phone.includes(search)
            );
        }

        setFilteredUsers(result);
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setSearch(e.target.value);
    };

    const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setFilter(e.target.value);
    };

    const getStats = (): { total: number; verified: number; active: number; expired: number } => {
        const now = new Date();
        return {
            total: users.length,
            verified: users.filter(u => u.is_verified).length,
            active: users.filter(u => u.is_active).length,
            expired: users.filter(u => u.expired_at && new Date(u.expired_at) < now).length,
        };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-spin opacity-75"></div>
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                            <span className="text-4xl">👥</span>
                        </div>
                    </div>
                    <p className="text-gray-600 font-semibold">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <span className="text-5xl">👥</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">
                                User Management
                            </h1>
                            <p className="text-purple-200 text-lg font-medium">
                                View and manage registered users
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: '👥', label: 'Total Users', value: stats.total, gradient: 'from-blue-500 to-blue-700' },
                    { icon: '✅', label: 'Verified', value: stats.verified, gradient: 'from-green-500 to-emerald-600' },
                    { icon: '⚡', label: 'Active', value: stats.active, gradient: 'from-purple-500 to-purple-700' },
                    { icon: '⏰', label: 'Expired', value: stats.expired, gradient: 'from-red-500 to-pink-600' },
                ].map((stat, index) => (
                    <div
                        key={index}
                        className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300`}
                    >
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{stat.icon}</span>
                            </div>
                            <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                            <p className="text-4xl font-black">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Search */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <span>🔍</span> Search Users
                        </label>
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by name, email or phone..."
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <span>🎯</span> Filter Status
                        </label>
                        <select
                            value={filter}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium"
                        >
                            <option value="all">All Users</option>
                            <option value="verified">Verified Only</option>
                            <option value="active">Active Subscriptions</option>
                            <option value="expired">Expired Subscriptions</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 mb-6">
                            <span className="text-8xl">🔍</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 mb-2">No users found</p>
                        <p className="text-gray-600">
                            {search || filter !== 'all' ? 'Try adjusting your filters' : 'No registered users yet'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Package
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Expires
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user, index) => {
                                    const isExpired = user.expired_at && new Date(user.expired_at) < new Date();
                                    return (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">ID: {user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-gray-800 font-medium flex items-center gap-2">
                                                    <span>📧</span> {user.email}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                    <span>📱</span> {user.phone}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${user.is_verified
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {user.is_verified ? '✅ Verified' : '⏳ Pending'}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit ${user.is_active && !isExpired
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {user.is_active && !isExpired ? '⚡ Active' : '❌ Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {user.package_name ? (
                                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                                                        📦 {user.package_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">No package</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                {user.expired_at ? (
                                                    <div className={`flex items-center gap-2 ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                                        <span>{isExpired ? '⏰' : '📅'}</span>
                                                        <span className="text-sm font-medium">
                                                            {new Date(user.expired_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
