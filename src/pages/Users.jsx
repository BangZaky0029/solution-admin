import { useState, useEffect, useMemo } from 'react';
import { getUsers } from '../api/controllers/userController';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (search) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search)
      );
    }

    if (filter === 'verified') filtered = filtered.filter(u => u.is_verified);
    else if (filter === 'unverified') filtered = filtered.filter(u => !u.is_verified);
    else if (filter === 'active') filtered = filtered.filter(u => u.package_name && u.is_active && new Date(u.expired_at) > new Date());
    else if (filter === 'expired') filtered = filtered.filter(u => !u.package_name || !u.is_active || new Date(u.expired_at) <= new Date());

    return filtered;
  };

  // Gunakan useMemo supaya filteredUsers selalu update saat users, search, atau filter berubah
  const filteredUsers = useMemo(() => getFilteredUsers(), [users, search, filter]);

  // StatCard component
  const StatCard = ({ icon, title, value, gradient, delay }) => (
    <div
      className="relative overflow-hidden rounded-2xl shadow-xl group hover:scale-105 transition-all duration-300"
      style={{ animationDelay: delay }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>

      <div className="relative z-10 p-6 text-white">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
          <span className="text-4xl">{icon}</span>
        </div>
        <p className="text-white/80 text-sm font-semibold mb-1">{title}</p>
        <p className="text-5xl font-black">{value}</p>
      </div>
    </div>
  );

  // Status badge
  const getStatusBadge = (user) => {
  if (!user.package_name) {
    return <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-xs font-black">No Package</span>;
  }

  const now = new Date();
  const expired = new Date(user.expired_at) <= now;

  if (expired) {
    return <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs font-black flex items-center gap-2">⚠️ Expired</span>;
  } else {
    return <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black flex items-center gap-2">✅ Active</span>;
  }
};


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <span className="text-5xl">👥</span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-2">User Management</h1>
            <p className="text-purple-200 text-lg font-medium">View and manage all user accounts</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon="👥" title="Total Users" value={users.length} gradient="from-blue-500 to-blue-700" delay="0s" />
        <StatCard icon="✅" title="Verified" value={users.filter(u => u.is_verified).length} gradient="from-green-500 to-emerald-700" delay="0.1s" />
        <StatCard icon="📦" title="Active Packages" value={users.filter(u => u.package_name && u.is_active && new Date(u.expired_at) > new Date()).length} gradient="from-purple-500 to-purple-700" delay="0.2s" />
        <StatCard icon="⚠️" title="Expired" value={users.filter(u => !u.package_name || !u.is_active || new Date(u.expired_at) <= new Date()).length} gradient="from-red-500 to-pink-700" delay="0.3s" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-2xl">🔍</span> Search Users
            </label>
            <div className="relative group">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 transition-opacity -z-10 blur-xl"></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-2xl">🌪️</span> Filter By
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium cursor-pointer"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
              <option value="active">Active Packages</option>
              <option value="expired">Expired/No Package</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 mb-6">
              <span className="text-8xl">🔍</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">No users found</p>
            <p className="text-gray-600">Try different search terms or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-5 text-center text-xs font-black text-gray-700 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-5 text-center text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={`${user.id}-${index}`}
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-sm animate-pulse"></div>
                          <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {user.name ? user.name.charAt(0) : '?'}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-gray-900 flex items-center gap-2 mb-1"><span>📧</span>{user.email}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2"><span>📱</span>{user.phone}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {user.is_verified ? (
                        <div className="inline-block bg-green-100 p-3 rounded-full"><span className="text-3xl">✓</span></div>
                      ) : (
                        <div className="inline-block bg-red-100 p-3 rounded-full"><span className="text-3xl">✕</span></div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {user.package_name ? (
                        <div>
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold mb-2">{user.package_name}</span>
                          <p className="text-xs text-gray-600 flex items-center gap-1"><span>⏳</span>Expires: {new Date(user.expired_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium">No package</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">{getStatusBadge(user)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-xl">📅</span>
                        <span className="font-medium">{new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
