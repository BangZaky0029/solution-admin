import { FC, useEffect, useState, ChangeEvent } from 'react';
import { getUsers } from '../api/controllers/userController';
import type { User } from '../types';
import UserDetailModal from '../components/UserDetailModal';

interface UsersData {
    data: User[];
    success: boolean;
}

// Sub-component for Search Highlighting (Stabilo effect)
const HighlightText: FC<{ text: string, highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => (
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-[2px] px-0.5">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            ))}
        </span>
    );
};

const Users: FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [search, setSearch] = useState<string>('');
    const [filter, setFilter] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

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
                u.name.toLowerCase().startsWith(searchLower) ||
                u.email.toLowerCase().includes(searchLower) ||
                u.phone.includes(search)
            );
        }

        setFilteredUsers(result);
        setCurrentPage(1); // Reset to first page when search/filter changes
    };

    // Calculate Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    const handleViewDetail = (id: number) => {
        setSelectedUserId(id);
        setIsDetailModalOpen(true);
    };

    const handleExportCsv = () => {
        const headers = ["ID", "Name", "Email", "Phone", "Verified", "Active", "Package", "Expires", "Last Login", "Login Count"];
        const rows = filteredUsers.map(user => [
            user.id,
            `"${user.name}"`,
            user.email,
            `'${user.phone}'`, // prevent spreadsheet auto-format
            user.is_verified ? 'Yes' : 'No',
            user.is_active ? 'Yes' : 'No',
            `"${user.package_name || 'No Package'}"`,
            user.expired_at ? new Date(user.expired_at).toLocaleDateString('id-ID') : '',
            user.last_login_at ? new Date(user.last_login_at).toLocaleString('id-ID') : '',
            user.login_count || 0
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Users_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = getStats();

    const PaginationControls = () => (
        <div className="p-6 bg-white border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-gray-500">
                Found <span className="text-purple-600 font-bold">{filteredUsers.length}</span> users 
                {filteredUsers.length > 0 && ` (Showing ${Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)}-${Math.min(filteredUsers.length, currentPage * itemsPerPage)})`}
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        ← Prev
                    </button>
                    
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            // Logic to show a few numbers around current page
                            if (
                                totalPages <= 7 ||
                                pageNum === 1 || 
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                                            currentPage === pageNum
                                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                pageNum === currentPage - 2 || 
                                pageNum === currentPage + 2
                            ) {
                                return <span key={pageNum} className="text-gray-400 font-black">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );

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
                
                <button
                    onClick={handleExportCsv}
                    className="absolute bottom-6 right-8 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                >
                    <span>📊</span> Export CSV
                </button>
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

            {/* Users List (Responsive: Cards on Mobile, Table on Desktop) */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {paginatedUsers.length === 0 ? (
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
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 p-4">
                            {paginatedUsers.map((user, index) => {
                                const isExpired = user.expired_at && new Date(user.expired_at) < new Date();
                                return (
                                    <div
                                        key={user.id}
                                        className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">
                                                    <HighlightText text={user.name} highlight={search} />
                                                </p>
                                                <p className="text-xs text-gray-500">ID: {user.id}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${user.is_verified
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {user.is_verified ? '✅ Verified' : '⏳ Pending'}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${user.is_active && !isExpired
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.is_active && !isExpired ? '⚡ Active' : '❌ Inactive'}
                                            </span>
                                            {user.package_name && (
                                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                                                    📦 {user.package_name}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 pt-3 border-t border-gray-200">
                                            <p className="text-sm text-gray-700 flex items-center gap-2">
                                                <span>📧</span> <HighlightText text={user.email} highlight={search} />
                                            </p>
                                            <p className="text-sm text-gray-700 flex items-center gap-2">
                                                <span>📱</span> <HighlightText text={user.phone} highlight={search} />
                                            </p>
                                            <div className="pt-2 flex justify-between items-center">
                                                {user.expired_at ? (
                                                    <div className={`flex items-center gap-2 text-sm font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                                        <span>{isExpired ? '⏰ Expired:' : '📅 Expires:'}</span>
                                                        <span>
                                                            {new Date(user.expired_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">- No expiration date -</span>
                                                )}
                                                
                                                <button 
                                                    onClick={() => handleViewDetail(user.id)}
                                                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    View Detail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
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
                                        <th className="px-6 py-5 text-right text-xs font-black text-gray-700 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {paginatedUsers.map((user, index) => {
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
                                                            <p className="font-bold text-gray-900">
                                                                <HighlightText text={user.name} highlight={search} />
                                                            </p>
                                                            <p className="text-sm text-gray-500">ID: {user.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-gray-800 font-medium flex items-center gap-2">
                                                        <span>📧</span> <HighlightText text={user.email} highlight={search} />
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                        <span>📱</span> <HighlightText text={user.phone} highlight={search} />
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
                                                <td className="px-6 py-5 text-right">
                                                    <button 
                                                        onClick={() => handleViewDetail(user.id)}
                                                        className="bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 font-bold px-4 py-2 rounded-xl transition-colors inline-block"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <PaginationControls />
                    </>
                )}
            </div>

            {/* Modal */}
            {selectedUserId && (
                <UserDetailModal 
                    userId={selectedUserId} 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default Users;
