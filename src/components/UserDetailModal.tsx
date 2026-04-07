import { FC, useEffect, useState } from 'react';
import { getUserById } from '../api/controllers/userController';
import type { UserDetail } from '../types';

interface Props {
    userId: number;
    isOpen: boolean;
    onClose: () => void;
}

const UserDetailModal: FC<Props> = ({ userId, isOpen, onClose }) => {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen && userId) {
            loadUserDetail();
        }
    }, [isOpen, userId]);

    const loadUserDetail = async () => {
        setLoading(true);
        try {
            const data = await getUserById(userId);
            setUser(data);
        } catch (error) {
            console.error('Failed to load user info', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="relative bg-gradient-to-r from-purple-700 to-indigo-800 p-6 flex justify-between items-center text-white shrink-0">
                    <div>
                        <h2 className="text-2xl font-black">User Details</h2>
                        <p className="text-purple-200 text-sm mt-1">Viewing ID: {userId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading user data...</p>
                        </div>
                    ) : user ? (
                        <div className="space-y-8">
                            
                            {/* Basics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span>👤</span> Basic Info
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Name</p>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</p>
                                            <p className="font-medium text-gray-900">{user.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Phone</p>
                                            <p className="font-medium text-gray-900">{user.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Verification Status</p>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mt-1 ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {user.is_verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span>📊</span> Analytics
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Joined Date</p>
                                            <p className="font-medium text-gray-900">{new Date(user.created_at).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Last Login</p>
                                            <p className="font-medium text-gray-900">
                                                {user.last_login_at ? new Date(user.last_login_at).toLocaleString('id-ID') : 'Never'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Login Count</p>
                                            <p className="font-medium text-gray-900 bg-purple-100 text-purple-700 w-max px-3 py-1 rounded-full mt-1 border border-purple-200">
                                                {user.login_count || 0} times
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active & History Tokens */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <span>📦</span> Subscription History
                                </h3>
                                {user.tokens && user.tokens.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.tokens.map(token => (
                                            <div key={token.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
                                                <div>
                                                    <p className="font-bold text-gray-900">{token.package_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(token.activated_at).toLocaleDateString()} - {new Date(token.expired_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="mt-2 md:mt-0">
                                                    {token.is_active && new Date(token.expired_at) > new Date() ? (
                                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">⚡ Active</span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Expired</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">No subscription history found.</p>
                                )}
                            </div>

                            {/* Payments History */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <span>💳</span> Payment Logs
                                </h3>
                                {user.payments && user.payments.length > 0 ? (
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-600 font-semibold">
                                                <tr>
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Package</th>
                                                    <th className="px-4 py-3">Amount</th>
                                                    <th className="px-4 py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {user.payments.map(payment => (
                                                    <tr key={payment.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(payment.created_at).toLocaleDateString('id-ID')}</td>
                                                        <td className="px-4 py-3 font-medium text-gray-900">{payment.package_name}</td>
                                                        <td className="px-4 py-3">Rp {(payment.amount || 0).toLocaleString('id-ID')}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                                                payment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                                payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {payment.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">No payment records found.</p>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div className="text-center py-10">User not found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
