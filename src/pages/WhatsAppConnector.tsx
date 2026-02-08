import { FC, useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import type { WhatsAppStatus, WhatsAppStatusConfig, SendMessageForm, SendMessageResult } from '../types';

// ============================================
// WhatsApp Gateway API Configuration
// ============================================
const WA_API_BASE = import.meta.env.VITE_WA_API_URL || 'http://localhost:3001';

interface WhatsAppConnectionState {
    status: 'connected' | 'disconnected' | 'waiting_qr' | 'connecting';
    isConnected: boolean;
    phoneNumber: string | null;
    hasQR: boolean;
    qrImage: string | null;
    user: {
        id?: string;
        name?: string;
    } | null;
}

const WhatsAppConnector: FC = () => {
    // Connection state
    const [connectionState, setConnectionState] = useState<WhatsAppConnectionState>({
        status: 'disconnected',
        isConnected: false,
        phoneNumber: null,
        hasQR: false,
        qrImage: null,
        user: null
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Send message state
    const [sendForm, setSendForm] = useState<SendMessageForm>({ phone: '', message: '' });
    const [sendResult, setSendResult] = useState<SendMessageResult | null>(null);
    const [sending, setSending] = useState<boolean>(false);

    // Logout state
    const [loggingOut, setLoggingOut] = useState<boolean>(false);

    // ============================================
    // API Functions
    // ============================================

    /**
     * Fetch connection status from WhatsApp Gateway
     */
    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/status`);
            const data = await response.json();

            if (data.success !== false) {
                setConnectionState({
                    status: data.status || 'disconnected',
                    isConnected: data.isConnected || false,
                    phoneNumber: data.phoneNumber || null,
                    hasQR: data.hasQR || false,
                    qrImage: null,
                    user: data.user || null
                });

                // If QR is available, fetch it
                if (data.hasQR) {
                    await fetchQRCode();
                }
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching status:', err);
            setError('Failed to connect to WhatsApp Gateway');
            setConnectionState(prev => ({
                ...prev,
                status: 'disconnected',
                isConnected: false
            }));
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch QR code for scanning
     */
    const fetchQRCode = async () => {
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/qr`);
            const data = await response.json();

            if (data.success && data.qrImage) {
                setConnectionState(prev => ({
                    ...prev,
                    qrImage: data.qrImage,
                    hasQR: true
                }));
            }
        } catch (err) {
            console.error('Error fetching QR code:', err);
        }
    };

    /**
     * Send message via WhatsApp Gateway
     */
    const handleSendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setSending(true);
        setSendResult(null);

        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: sendForm.phone,
                    message: sendForm.message,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSendResult({
                    success: true,
                    message: `Message sent successfully! ID: ${data.messageId}`,
                    sentTo: sendForm.phone,
                });
                setSendForm({ phone: '', message: '' });
            } else {
                setSendResult({
                    success: false,
                    message: data.error || 'Failed to send message',
                });
            }
        } catch (error) {
            console.error('Send message failed:', error);
            setSendResult({
                success: false,
                message: 'Failed to send message. Please check your connection.',
            });
        } finally {
            setSending(false);
        }
    };

    /**
     * Logout and clear session
     */
    const handleLogout = async () => {
        if (!confirm('Are you sure you want to logout? You will need to scan QR code again.')) {
            return;
        }

        setLoggingOut(true);
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/logout`, {
                method: 'POST',
            });

            const data = await response.json();

            if (data.success) {
                setConnectionState({
                    status: 'disconnected',
                    isConnected: false,
                    phoneNumber: null,
                    hasQR: false,
                    qrImage: null,
                    user: null
                });
                // Refetch status to get new QR
                setTimeout(() => fetchStatus(), 2000);
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    /**
     * Refresh status manually
     */
    const handleRefresh = () => {
        setLoading(true);
        fetchStatus();
    };

    // ============================================
    // Effects
    // ============================================

    // Initial fetch and polling
    useEffect(() => {
        fetchStatus();

        // Poll every 10 seconds for status updates (slower for stable QR display)
        const interval = setInterval(fetchStatus, 10000);

        return () => clearInterval(interval);
    }, [fetchStatus]);

    // ============================================
    // UI Helpers
    // ============================================

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setSendForm(prev => ({ ...prev, [name]: value }));
    };

    const getDisplayStatus = (): WhatsAppStatus => {
        if (connectionState.isConnected) return 'ready';
        if (connectionState.hasQR || connectionState.status === 'waiting_qr') return 'qr';
        if (connectionState.status === 'connecting') return 'idle';
        return 'disconnected';
    };

    const getStatusConfig = (currentStatus: WhatsAppStatus): WhatsAppStatusConfig => {
        const configs: Record<WhatsAppStatus, WhatsAppStatusConfig> = {
            idle: { color: 'from-gray-500 to-gray-600', label: 'Connecting...', icon: '⏳' },
            qr: { color: 'from-yellow-500 to-orange-500', label: 'Scan QR Code', icon: '📱' },
            ready: { color: 'from-green-500 to-emerald-600', label: 'Connected', icon: '✅' },
            disconnected: { color: 'from-red-500 to-pink-600', label: 'Disconnected', icon: '❌' },
            error: { color: 'from-red-600 to-red-800', label: 'Error', icon: '⚠️' },
        };
        return configs[currentStatus] || configs.disconnected;
    };

    const displayStatus = getDisplayStatus();
    const statusConfig = getStatusConfig(displayStatus);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                                <span className="text-5xl">💬</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">
                                    WhatsApp Gateway
                                </h1>
                                <p className="text-emerald-100 text-lg font-medium">
                                    Connected to Baileys API • Supabase Session
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-semibold transition-all duration-300 flex items-center gap-2"
                            >
                                <span className={loading ? 'animate-spin' : ''}>🔄</span>
                                Refresh
                            </button>
                            {connectionState.isConnected && (
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-semibold transition-all duration-300 flex items-center gap-2"
                                >
                                    {loggingOut ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <span>🚪</span>
                                            Logout
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-bold text-red-800">Connection Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                        <p className="text-red-500 text-xs mt-1">
                            Make sure WhatsApp Gateway is running on {WA_API_BASE}
                        </p>
                    </div>
                </div>
            )}

            {/* Status & QR Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className={`bg-gradient-to-r ${statusConfig.color} p-6`}>
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                <span className="text-4xl">{statusConfig.icon}</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Connection Status</h2>
                                <p className="text-white/90 font-semibold mt-1">{statusConfig.label}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Status Indicator */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative">
                                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${statusConfig.color} flex items-center justify-center shadow-xl`}>
                                    <span className="text-5xl">{statusConfig.icon}</span>
                                </div>
                                {displayStatus === 'ready' && (
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-ping opacity-20"></div>
                                )}
                            </div>
                        </div>

                        {/* Status Details */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Status</span>
                                <span className={`font-bold capitalize ${displayStatus === 'ready' ? 'text-green-600' :
                                    displayStatus === 'qr' ? 'text-yellow-600' :
                                        displayStatus === 'error' || displayStatus === 'disconnected' ? 'text-red-600' :
                                            'text-gray-600'
                                    }`}>
                                    {connectionState.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Gateway</span>
                                <span className={`font-bold ${!error ? 'text-green-600' : 'text-red-600'}`}>
                                    {!error ? '🟢 Online' : '🔴 Offline'}
                                </span>
                            </div>

                            {connectionState.phoneNumber && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 font-medium">Phone</span>
                                    <span className="font-bold text-gray-800">+{connectionState.phoneNumber}</span>
                                </div>
                            )}

                            {connectionState.user?.name && (
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 font-medium">Name</span>
                                    <span className="font-bold text-gray-800">{connectionState.user.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                <span className="text-4xl">📱</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">QR Code Scanner</h2>
                                <p className="text-white/90 font-medium mt-1">Scan to link WhatsApp</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                        {loading ? (
                            <div className="text-center">
                                <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 mb-4">
                                    <span className="text-8xl animate-pulse">⏳</span>
                                </div>
                                <p className="text-xl font-bold text-gray-600">Loading...</p>
                                <p className="text-gray-500 mt-2">Connecting to gateway</p>
                            </div>
                        ) : connectionState.qrImage ? (
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-md opacity-30"></div>
                                <div className="relative bg-white p-4 rounded-2xl shadow-xl">
                                    <img src={connectionState.qrImage} alt="QR Code" className="w-64 h-64" />
                                </div>
                                <p className="text-center mt-4 text-gray-600 font-medium">
                                    Scan this QR with WhatsApp
                                </p>
                                <p className="text-center text-gray-400 text-sm mt-1">
                                    Linked Devices → Link a Device
                                </p>
                            </div>
                        ) : displayStatus === 'ready' ? (
                            <div className="text-center">
                                <div className="inline-block bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 mb-4">
                                    <span className="text-8xl">✅</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">Connected!</p>
                                <p className="text-gray-600 mt-2">WhatsApp is ready to send messages</p>
                                {connectionState.phoneNumber && (
                                    <p className="text-green-500 font-semibold mt-1">+{connectionState.phoneNumber}</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 mb-4">
                                    <span className="text-8xl">💤</span>
                                </div>
                                <p className="text-xl font-bold text-gray-600">Waiting for Connection</p>
                                <p className="text-gray-500 mt-2">QR code will appear here</p>
                                {error && (
                                    <p className="text-red-500 text-sm mt-2">Check if gateway is running</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Send Message Card */}
            {displayStatus === 'ready' && (
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                <span className="text-4xl">✉️</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Send Manual Message</h2>
                                <p className="text-white/90 font-medium mt-1">Send a test message via WhatsApp</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSendMessage} className="p-8 space-y-6">
                        {/* Result Alert */}
                        {sendResult && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${sendResult.success
                                ? 'bg-green-50 border-2 border-green-200'
                                : 'bg-red-50 border-2 border-red-200'
                                }`}>
                                <span className="text-2xl">{sendResult.success ? '✅' : '❌'}</span>
                                <div>
                                    <p className={`font-bold ${sendResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {sendResult.success ? 'Success!' : 'Failed!'}
                                    </p>
                                    <p className={`text-sm ${sendResult.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {sendResult.message}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <span>📱</span> Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={sendForm.phone}
                                    onChange={handleFormChange}
                                    placeholder="628123456789"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium"
                                    required
                                    disabled={sending}
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: 628xxxxxxxxxx (without +)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <span>💬</span> Message
                                </label>
                                <textarea
                                    name="message"
                                    value={sendForm.message}
                                    onChange={handleFormChange}
                                    placeholder="Enter your message..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium resize-none"
                                    required
                                    disabled={sending}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-300 transform relative overflow-hidden ${sending
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-xl'
                                }`}
                        >
                            <span className="relative flex items-center justify-center gap-3">
                                {sending ? (
                                    <>
                                        <span className="animate-spin text-2xl">⏳</span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl">📤</span>
                                        Send Message
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            )}

            {/* API Info Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                    <span>🔌</span> API Endpoints
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-3 rounded-xl">
                        <code className="text-green-600">GET</code>
                        <span className="text-gray-600 ml-2">/api/whatsapp/status</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl">
                        <code className="text-green-600">GET</code>
                        <span className="text-gray-600 ml-2">/api/whatsapp/qr</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl">
                        <code className="text-blue-600">POST</code>
                        <span className="text-gray-600 ml-2">/api/whatsapp/send</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl">
                        <code className="text-red-600">POST</code>
                        <span className="text-gray-600 ml-2">/api/whatsapp/logout</span>
                    </div>
                </div>
                <p className="text-gray-500 text-xs mt-3">
                    Gateway URL: <code className="bg-gray-200 px-2 py-1 rounded">{WA_API_BASE}</code>
                </p>
            </div>
        </div>
    );
};

export default WhatsAppConnector;
