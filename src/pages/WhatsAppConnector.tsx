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
    const SESSIONS = [
        { id: 'main-session', name: 'Main Gateway', icon: '⚡' },
        { id: 'wa-bot-ai', name: 'AI Assistant', icon: '🤖' },
        { id: 'CS-BOT', name: 'Customer Service', icon: '🏢' }
    ];

    // Connection state
    const [connectionState, setConnectionState] = useState<WhatsAppConnectionState>({
        status: 'disconnected',
        isConnected: false,
        phoneNumber: null,
        hasQR: false,
        qrImage: null,
        user: null
    });
    const [sessionId, setSessionId] = useState<string>(SESSIONS[0].id);
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

    const fetchQRCode = useCallback(async (sid: string) => {
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sid}/qr`);
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
    }, []);

    const fetchStatus = useCallback(async (sid: string) => {
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sid}/status`);
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

                if (data.hasQR) {
                    await fetchQRCode(sid);
                }
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching status:', err);
            setError('Failed to connect to WhatsApp Gateway');
            setConnectionState({
                status: 'disconnected',
                isConnected: false,
                phoneNumber: null,
                hasQR: false,
                qrImage: null,
                user: null
            });
        } finally {
            setLoading(false);
        }
    }, [fetchQRCode]);

    /**
     * Send message via WhatsApp Gateway
     */
    const handleSendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setSending(true);
        setSendResult(null);

        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sessionId}/send`, {
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
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sessionId}/logout`, {
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
                setTimeout(() => fetchStatus(sessionId), 2000);
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoggingOut(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchStatus(sessionId);
    };

    // ============================================
    // Effects
    // ============================================

    useEffect(() => {
        setLoading(true);
        fetchStatus(sessionId);
        const interval = setInterval(() => fetchStatus(sessionId), 10000);
        return () => clearInterval(interval);
    }, [sessionId, fetchStatus]);

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
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#075e54] via-[#128c7e] to-[#25d366] rounded-3xl p-8 shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full opacity-5 transform -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-inner">
                                <span className="text-6xl drop-shadow-lg">🍃</span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                                    WhatsApp <span className="text-[#dcf8c6]">Gateway</span>
                                </h1>
                                <p className="text-emerald-50/80 text-lg font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Cloud Multi-Session Infrastructure
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-2xl px-6 py-3 text-white font-bold transition-all duration-300 flex items-center gap-3 active:scale-95 shadow-lg"
                            >
                                <span className={loading ? 'animate-spin' : ''}>🔄</span>
                                Refresh
                            </button>
                            {connectionState.isConnected && (
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 backdrop-blur-md rounded-2xl px-6 py-3 text-red-100 font-bold transition-all duration-300 flex items-center gap-3 active:scale-95 shadow-lg"
                                >
                                    {loggingOut ? '⏳' : '🚪'} Logout
                                </button>
                            )}
                        </div>
                    </div>

                    {/* NEW: Premium Session Selector */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {SESSIONS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSessionId(s.id)}
                                className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-500 ${sessionId === s.id
                                    ? 'bg-white border-white shadow-2xl scale-105'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className={`text-3xl p-3 rounded-xl transition-all duration-500 ${sessionId === s.id ? 'bg-[#dcf8c6] scale-110 shadow-md' : 'bg-white/10'
                                    }`}>
                                    {s.icon}
                                </div>
                                <div className="text-left">
                                    <p className={`text-xs font-black uppercase tracking-[0.2em] mb-1 ${sessionId === s.id ? 'text-[#075e54]/50' : 'text-white/40'
                                        }`}>
                                        Instance
                                    </p>
                                    <p className={`text-lg font-black ${sessionId === s.id ? 'text-[#075e54]' : 'text-white'
                                        }`}>
                                        {s.name}
                                    </p>
                                </div>
                                {sessionId === s.id && (
                                    <div className="absolute -top-3 -right-3 bg-[#25d366] text-white p-1 rounded-full border-4 border-[#128c7e] shadow-lg animate-bounce">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex items-center gap-4 animate-shake shadow-xl">
                    <div className="bg-red-100 p-3 rounded-2xl text-3xl">⚠️</div>
                    <div>
                        <p className="font-black text-red-900 text-lg uppercase tracking-wider">Gateway Connection Lost</p>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Status & QR Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Card */}
                <div className="group bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 hover:shadow-emerald-100 transition-all duration-500">
                    <div className={`bg-gradient-to-r ${statusConfig.color} p-7 transition-colors duration-500`}>
                        <div className="flex items-center gap-5">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-inner">
                                <span className="text-5xl drop-shadow-md">{statusConfig.icon}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Session Intel</h2>
                                <p className="text-white/90 font-bold mt-1 uppercase text-sm tracking-widest">{statusConfig.label}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10">
                        <div className="flex items-center justify-center mb-10">
                            <div className="relative">
                                <div className={`w-32 h-32 rounded-[2rem] bg-gradient-to-br ${statusConfig.color} flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500`}>
                                    <span className="text-6xl drop-shadow-lg">{statusConfig.icon}</span>
                                </div>
                                {displayStatus === 'ready' && (
                                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-green-400 to-emerald-500 animate-ping opacity-20"></div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Auth Status', value: connectionState.status, type: 'status' },
                                { label: 'Node Engine', value: !error ? '🟢 ACTIVE' : '🔴 OFFLINE', type: 'online' },
                                { label: 'Registered ID', value: connectionState.phoneNumber ? `+${connectionState.phoneNumber}` : 'Unidentified', type: 'id' },
                                { label: 'Cloud Identity', value: connectionState.user?.name || 'Guest Instance', type: 'name' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-gray-50/80 hover:bg-[#dcf8c6]/30 rounded-2xl transition-colors duration-300 border border-transparent hover:border-[#25d366]/20">
                                    <span className="text-gray-500 font-black uppercase text-xs tracking-[0.2em]">{item.label}</span>
                                    <span className={`font-black tracking-tight ${item.type === 'status' ? (displayStatus === 'ready' ? 'text-green-600' : 'text-yellow-600') :
                                        item.type === 'online' ? (!error ? 'text-emerald-500' : 'text-red-500') : 'text-gray-800'
                                        }`}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* QR Code Card */}
                <div className="group bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 hover:shadow-purple-100 transition-all duration-500">
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-7">
                        <div className="flex items-center gap-5">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-inner">
                                <span className="text-5xl drop-shadow-md">🔗</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Device Linking</h2>
                                <p className="text-white/90 font-bold mt-1 uppercase text-sm tracking-widest">Connect your mobile device</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 flex flex-col items-center justify-center min-h-[420px]">
                        {loading ? (
                            <div className="text-center animate-pulse">
                                <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-[2rem] p-12 mb-6 shadow-inner">
                                    <span className="text-9xl">📡</span>
                                </div>
                                <p className="text-2xl font-black text-gray-800 tracking-tight">Syncing Instance...</p>
                                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-2">{sessionId}</p>
                            </div>
                        ) : connectionState.qrImage ? (
                            <div className="relative group/qr">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover/qr:opacity-40 transition-opacity duration-500"></div>
                                <div className="relative bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-gray-50">
                                    <img src={connectionState.qrImage} alt="QR Code" className="w-64 h-64 rounded-xl" />
                                </div>
                                <div className="text-center mt-8">
                                    <p className="text-xl font-black text-gray-800 tracking-tight">Scan with WhatsApp</p>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className="text-xs font-black bg-purple-100 text-purple-600 px-3 py-1 rounded-full uppercase tracking-wider">Linked Devices</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="text-xs font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider">Link a Device</span>
                                    </div>
                                </div>
                            </div>
                        ) : displayStatus === 'ready' ? (
                            <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                <div className="inline-block bg-gradient-to-br from-emerald-50 to-green-100 rounded-[2.5rem] p-12 mb-8 shadow-inner relative">
                                    <span className="text-9xl drop-shadow-xl relative z-10">🌿</span>
                                    <div className="absolute inset-0 rounded-[2.5rem] bg-green-200/50 scale-90 blur-xl"></div>
                                </div>
                                <p className="text-4xl font-black text-[#075e54] tracking-tight">Identity Verified</p>
                                <p className="text-gray-500 font-bold mt-3 max-w-[280px] mx-auto leading-relaxed">Instance <span className="text-[#25d366]">{sessionId}</span> is actively processing requests</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="inline-block bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] p-12 mb-6 border-4 border-dashed border-gray-200">
                                    <span className="text-8xl opacity-50">💤</span>
                                </div>
                                <p className="text-2xl font-black text-gray-400 tracking-tight uppercase tracking-[0.2em]">Hibernating</p>
                                <p className="text-gray-400 font-bold text-sm mt-3">Waiting for terminal signals...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Manual Response Card */}
            {displayStatus === 'ready' && (
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 mt-12">
                    <div className="bg-gradient-to-r from-[#075e54] to-[#128c7e] p-8">
                        <div className="flex items-center gap-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-inner">
                                <span className="text-5xl">⚡</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">Direct Terminal</h2>
                                <p className="text-white/80 font-bold mt-1 uppercase text-sm tracking-widest">Send prioritized manual response</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSendMessage} className="p-12 space-y-8">
                        {sendResult && (
                            <div className={`p-6 rounded-3xl flex items-center gap-5 animate-slide-up ${sendResult.success ? 'bg-emerald-50 border-2 border-emerald-200 shadow-lg shadow-emerald-50' : 'bg-red-50 border-2 border-red-200'
                                }`}>
                                <div className={`text-3xl p-3 rounded-2xl ${sendResult.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                    {sendResult.success ? '✨' : '💥'}
                                </div>
                                <div>
                                    <p className={`font-black text-xl tracking-tight ${sendResult.success ? 'text-emerald-900' : 'text-red-900'}`}>
                                        {sendResult.success ? 'Transmission Success!' : 'System Failure!'}
                                    </p>
                                    <p className={`font-bold ${sendResult.success ? 'text-emerald-600' : 'text-red-600'}`}>{sendResult.message}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                                    <span className="w-1.5 h-1.5 bg-[#25d366] rounded-full"></span> Destination JID
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={sendForm.phone}
                                    onChange={handleFormChange}
                                    placeholder="e.g. 628123456789"
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:ring-[10px] focus:ring-[#25d366]/10 focus:border-[#25d366] transition-all duration-300 outline-none font-black text-xl placeholder:text-gray-300"
                                    required
                                    disabled={sending}
                                />
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-4">International format required (Omit '+')</p>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                                    <span className="w-1.5 h-1.5 bg-[#128c7e] rounded-full"></span> Data Payload
                                </label>
                                <textarea
                                    name="message"
                                    value={sendForm.message}
                                    onChange={handleFormChange}
                                    placeholder="Type your message broadcast here..."
                                    rows={3}
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:ring-[10px] focus:ring-[#128c7e]/10 focus:border-[#128c7e] transition-all duration-300 outline-none font-bold text-lg placeholder:text-gray-300 resize-none"
                                    required
                                    disabled={sending}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className={`w-full py-6 rounded-3xl font-black text-white text-xl tracking-widest transition-all duration-500 transform group relative overflow-hidden shadow-2xl ${sending ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#25d366] hover:bg-[#075e54] hover:-translate-y-1 active:scale-95'
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-4">
                                {sending ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                        TRANSMITTING...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-3xl">🚀</span>
                                        EXECUTE BROADCAST
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default WhatsAppConnector;
