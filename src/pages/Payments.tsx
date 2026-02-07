import { useState, useMemo } from 'react';
import { usePayments, useActivatePayment } from '../hooks/usePayments';
import { useUIStore } from '../stores/uiStore';
import { LoadingSpinner, EmptyState, Modal, Badge } from '../components/ui';
import api from '../api/api';
import type { Payment } from '../types';

const imageBaseURL = (api?.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');

const Payments = () => {
    const [search, setSearch] = useState('');
    const [selectedProof, setSelectedProof] = useState<string | null>(null);

    // React Query hooks
    const { data: payments = [], isLoading, isError, refetch } = usePayments();
    const activateMutation = useActivatePayment();
    const { addNotification } = useUIStore();

    // Filtered payments with useMemo
    const filteredPayments = useMemo(() => {
        if (!search) return payments;
        const searchLower = search.toLowerCase();
        return payments.filter((p: Payment) =>
            p.email?.toLowerCase().includes(searchLower) ||
            p.phone?.includes(search)
        );
    }, [search, payments]);

    const handleActivate = async (paymentId: string) => {
        if (!confirm('Are you sure you want to activate this payment?')) return;

        activateMutation.mutate(
            { payment_id: paymentId },
            {
                onSuccess: () => {
                    addNotification({
                        type: 'success',
                        title: 'Payment Activated!',
                        message: 'Package has been activated successfully.',
                    });
                },
                onError: () => {
                    addNotification({
                        type: 'error',
                        title: 'Activation Failed',
                        message: 'Failed to activate payment. Please try again.',
                    });
                },
            }
        );
    };

    if (isLoading) {
        return <LoadingSpinner size="lg" text="Loading payments..." icon="💳" />;
    }

    if (isError) {
        return (
            <EmptyState
                icon="❌"
                title="Failed to load payments"
                description="Something went wrong. Please try again."
                action={
                    <button
                        onClick={() => refetch()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                        Retry
                    </button>
                }
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 rounded-3xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <span className="text-5xl">💳</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">Payment Management</h1>
                            <p className="text-orange-100 text-lg font-medium">
                                Review and activate pending payment confirmations
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats & Search Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Stats Card */}
                <div className="lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-xl group hover:scale-105 transition-transform duration-300">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                <span className="text-4xl">⏳</span>
                            </div>
                            {activateMutation.isPending && (
                                <Badge variant="warning">Processing...</Badge>
                            )}
                        </div>
                        <p className="text-white/90 font-semibold mb-2">Pending Payments</p>
                        <p className="text-5xl font-black text-white">{filteredPayments.length}</p>
                        <p className="text-white/70 text-sm mt-2">Awaiting confirmation</p>
                    </div>
                </div>

                {/* Search Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🔍</span>
                        Search Payments
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by email or phone number..."
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none text-gray-800 font-medium"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 transition-opacity -z-10 rounded-xl blur-xl" />

                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-lg px-3 py-1 text-sm font-semibold text-gray-700 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Payments Table Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {filteredPayments.length === 0 ? (
                    <EmptyState
                        icon="🎉"
                        title="No pending payments"
                        description={search ? 'Try different search terms' : 'All payments have been processed'}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Customer Info
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Package
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Proof
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPayments.map((payment: Payment, index: number) => (
                                    <tr
                                        key={payment.id}
                                        className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                                    #
                                                </div>
                                                <span className="font-bold text-gray-900">{payment.payment_id || payment.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <span>📧</span>
                                                    {payment.email}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                    <span>📱</span>
                                                    {payment.phone}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="purple" icon="📦">
                                                {payment.package_name || 'N/A'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            {payment.proof_image ? (
                                                <button
                                                    onClick={() => setSelectedProof(`${imageBaseURL}/uploads/${payment.proof_image}`)}
                                                    className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                                >
                                                    <span className="text-xl">
                                                        {payment.proof_image.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'}
                                                    </span>
                                                    <span>View</span>
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 font-medium italic">No proof</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">📅</span>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {new Date(payment.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => handleActivate(String(payment.payment_id || payment.id))}
                                                disabled={activateMutation.isPending}
                                                className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="relative flex items-center gap-2">
                                                    <span className="text-xl">{activateMutation.isPending ? '⏳' : '✅'}</span>
                                                    {activateMutation.isPending ? 'Processing...' : 'Activate'}
                                                </span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Proof Modal */}
            <Modal
                isOpen={!!selectedProof}
                onClose={() => setSelectedProof(null)}
                title="Payment Proof"
                icon={selectedProof?.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'}
                size="lg"
            >
                {selectedProof && (
                    <div className="w-full h-[70vh] flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                        {selectedProof.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                                src={selectedProof}
                                title="Payment Proof PDF"
                                className="w-full h-full"
                            />
                        ) : (
                            <img
                                src={selectedProof}
                                alt="Payment Proof"
                                className="w-full h-full object-contain"
                            />
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Payments;
