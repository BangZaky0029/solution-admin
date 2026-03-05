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

    // Pairing Mode State
    const [linkMode, setLinkMode] = useState<'qr' | 'phone'>('qr');
    const [pairingPhone, setPairingPhone] = useState<string>('');
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [requestingCode, setRequestingCode] = useState<boolean>(false);

    // Session Registry state
    const [allSessions, setAllSessions] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Send message state
    const [sendForm, setSendForm] = useState<SendMessageForm>({ phone: '', message: '' });
    const [sendResult, setSendResult] = useState<SendMessageResult | null>(null);
    const [sending, setSending] = useState<boolean>(false);

    // Logout state
    const [loggingOut, setLoggingOut] = useState<boolean>(false);

    // ============================================
    // API Functions
    // ============================================

    const fetchAllSessions = useCallback(async () => {
        try {
            const response = await fetch(`${WA_API_BASE}/`);
            const data = await response.json();
            if (data.sessions) {
                setAllSessions(data.sessions);
            }
        } catch (err) {
            console.error('Error fetching all sessions:', err);
        }
    }, []);

    const fetchPairingCode = useCallback(async (sid: string) => {
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sid}/pairing-code`, {
                headers: { 'X-Session-Id': sid }
            });
            const data = await response.json();

            if (data.success && data.pairingCode) {
                setPairingCode(data.pairingCode);
            }
        } catch (err) {
            console.error('Error fetching pairing code:', err);
        }
    }, []);

    const fetchQRCode = useCallback(async (sid: string) => {
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sid}/qr`, {
                headers: { 'X-Session-Id': sid }
            });
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
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sid}/status`, {
                headers: { 'X-Session-Id': sid }
            });
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
                    // Also check for pairing code if in phone mode
                    if (linkMode === 'phone') {
                        await fetchPairingCode(sid);
                    }
                } else {
                    setPairingCode(null);
                }
            }
            setError(null);
            await fetchAllSessions();
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
    }, [fetchQRCode, fetchPairingCode, fetchAllSessions, linkMode]);

    const handleInitWithPhone = async () => {
        if (!pairingPhone) return alert('Please enter phone number');

        setRequestingCode(true);
        setPairingCode(null);
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sessionId}/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId
                },
                body: JSON.stringify({ phoneNumber: pairingPhone })
            });
            const data = await response.json();
            if (data.success) {
                setLinkMode('phone');
                // Status polling will take care of fetching the code
            } else {
                alert(data.error || 'Failed to initialize session');
            }
        } catch (err) {
            console.error('Init failure:', err);
        } finally {
            setRequestingCode(false);
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
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sessionId}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId
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
                await fetchAllSessions();
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
        if (!confirm(`Are you sure you want to logout [${sessionId}]? You will need to scan QR code again.`)) {
            return;
        }

        setLoggingOut(true);
        try {
            const response = await fetch(`${WA_API_BASE}/api/whatsapp/${sessionId}/logout`, {
                method: 'POST',
                headers: { 'X-Session-Id': sessionId }
            });

            const data = await response.json();

            if (data.success) {
                // Clear local connection state safely
                setConnectionState({
                    status: 'disconnected',
                    isConnected: false,
                    phoneNumber: null,
                    hasQR: false,
                    qrImage: null,
                    user: null
                });
                // Wait for backend to finish clearing and then refresh
                setTimeout(() => {
                    fetchStatus(sessionId);
                    fetchAllSessions();
                }, 2000);
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
        fetchAllSessions(); // Fetch all sessions on initial load and session change
        const interval = setInterval(() => fetchStatus(sessionId), 4000);
        return () => clearInterval(interval);
    }, [sessionId, fetchStatus, fetchAllSessions]);

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

    const aiSessions = allSessions.filter(s => s.id.startsWith('wa-bot-ai'));
    const activeAiCount = aiSessions.filter(s => s.status === 'open').length;
    const offlineAiCount = aiSessions.length - activeAiCount;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#075e54] via-[#128c7e] to-[#25d366] rounded-[3rem] p-10 shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full opacity-5 transform -translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                            <div className="bg-white/15 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.2)]">
                                <span className="text-7xl drop-shadow-2xl">🍃</span>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">
                                    Gateway <span className="text-[#dcf8c6]">APTO</span>
                                </h1>
                                <p className="text-emerald-50/90 text-xl font-bold flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300 shadow-[0_0_10px_#86efac]"></span>
                                    </span>
                                    Cloud Multi-Session Infrastructure
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md rounded-2xl px-8 py-4 text-white font-black transition-all duration-300 flex items-center gap-3 active:scale-95 shadow-xl group"
                            >
                                <span className={`text-2xl transition-transform duration-700 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}>🔄</span>
                                REFRESH
                            </button>
                            {connectionState.isConnected && (
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 backdrop-blur-md rounded-2xl px-8 py-4 text-red-100 font-black transition-all duration-300 flex items-center gap-3 active:scale-95 shadow-xl"
                                >
                                    <span className="text-2xl">{loggingOut ? '⏳' : '🚪'}</span> LOGOUT
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Premium Session Selector */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {SESSIONS.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSessionId(s.id)}
                                className={`group relative flex items-center gap-6 p-6 rounded-3xl border-2 transition-all duration-500 ${sessionId === s.id
                                    ? 'bg-white border-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] scale-[1.03] z-20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className={`text-4xl p-4 rounded-2xl transition-all duration-500 shadow-lg ${sessionId === s.id ? 'bg-[#dcf8c6] scale-110' : 'bg-white/10 group-hover:bg-white/20'
                                    }`}>
                                    {s.icon}
                                </div>
                                <div className="text-left flex-1">
                                    <p className={`text-xs font-black uppercase tracking-[0.25em] mb-1.5 ${sessionId === s.id ? 'text-[#075e54]/50' : 'text-white/40'
                                        }`}>
                                        INSTANCE
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className={`text-xl font-black ${sessionId === s.id ? 'text-[#075e54]' : 'text-white'
                                            }`}>
                                            {s.name}
                                        </p>
                                        {s.id === 'wa-bot-ai' && (
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${sessionId === s.id ? 'bg-purple-100 text-purple-600' : 'bg-white/10 text-white/60'
                                                }`}>
                                                MULTI
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {sessionId === s.id && (
                                    <div className="absolute -top-3 -right-3 bg-[#25d366] text-white p-2 rounded-full border-4 border-[#128c7e] shadow-lg animate-bounce z-30">
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
                <div className="bg-red-50 border-2 border-red-200 rounded-[2.5rem] p-8 flex items-center gap-6 animate-shake shadow-2xl">
                    <div className="bg-red-100 p-4 rounded-2xl text-4xl shadow-inner">⚠️</div>
                    <div>
                        <p className="font-black text-red-900 text-xl uppercase tracking-widest">Gateway Connection Lost</p>
                        <p className="text-red-700 font-bold mt-1 text-lg">{error}</p>
                    </div>
                </div>
            )}

            {/* Specialized View Logic */}
            {sessionId === 'wa-bot-ai' ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
                    {/* AI Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute -right-8 -bottom-8 text-[12rem] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">🤖</div>
                            <div className="relative z-10">
                                <p className="text-blue-100 font-black uppercase tracking-[0.25em] text-sm mb-4">Total AI Instances</p>
                                <div className="flex items-baseline gap-4">
                                    <h3 className="text-7xl font-black tracking-tighter">{aiSessions.length}</h3>
                                    <span className="text-blue-200 font-bold text-xl uppercase tracking-widest">Accounts</span>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <span className="bg-white/10 px-4 py-2 rounded-xl text-xs font-black backdrop-blur-md border border-white/20">Scalable AI</span>
                                    <span className="bg-white/10 px-4 py-2 rounded-xl text-xs font-black backdrop-blur-md border border-white/20">Isolated Storage</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 border border-emerald-100 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute -right-6 -bottom-6 text-9xl opacity-5 group-hover:scale-110 transition-transform duration-500">🟢</div>
                            <p className="text-emerald-500 font-black uppercase tracking-[0.25em] text-sm mb-4">Active Nodes</p>
                            <h3 className="text-7xl font-black text-gray-900 tracking-tighter">{activeAiCount}</h3>
                            <div className="mt-8">
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2">System Health</p>
                                <div className="w-full bg-emerald-50 h-3 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(activeAiCount / (aiSessions.length || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 border border-red-50 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute -right-6 -bottom-6 text-9xl opacity-5 group-hover:scale-110 transition-transform duration-500">💤</div>
                            <p className="text-red-400 font-black uppercase tracking-[0.25em] text-sm mb-4">Offline / Idle</p>
                            <h3 className="text-7xl font-black text-gray-900 tracking-tighter">{offlineAiCount}</h3>
                            <button className="mt-8 text-red-500 font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:gap-4 transition-all duration-300">
                                REBOOT CLUSTER <span>→</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Session Registry */}
                    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-purple-950 p-10">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-center gap-8">
                                    <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                                        <span className="text-6xl drop-shadow-2xl">🧠</span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">AI Neural Registry</h2>
                                        <p className="text-indigo-200/70 font-bold mt-1.5 uppercase text-sm tracking-[0.25em]">Scalable Multi-Account Deployment</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-xl">
                                    <div className="relative flex-1 group">
                                        <input
                                            type="text"
                                            placeholder="Search AI Accounts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-white placeholder:text-white/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 font-bold text-lg"
                                        />
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl opacity-40 group-hover:scale-110 transition-transform duration-300">🔍</span>
                                    </div>
                                    <button className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3">
                                        <span className="text-2xl">➕</span> ADD INSTANCE
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                                {aiSessions.length > 0 ? aiSessions.filter(s =>
                                    s.id.toLowerCase().includes(searchTerm.toLowerCase()) || (s.phone && s.phone.includes(searchTerm))
                                ).map((s) => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSessionId(s.id)}
                                        className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${sessionId === s.id
                                            ? 'bg-indigo-50 border-indigo-500 shadow-2xl shadow-indigo-200 scale-105'
                                            : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-50 hover:-translate-y-2'
                                            }`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div className={`p-5 rounded-[1.5rem] shadow-xl ${s.status === 'open' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <span className="text-3xl">{s.status === 'open' ? '🤖' : '💤'}</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <div className={`w-2.5 h-2.5 rounded-full ${s.status === 'open' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-gray-300'}`}></div>
                                                <div className={`w-2.5 h-2.5 rounded-full ${s.status === 'open' ? 'bg-emerald-500 animate-pulse delay-150 shadow-[0_0_8px_#10b981]' : 'bg-gray-300'}`}></div>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <h3 className={`font-black text-2xl truncate mb-1 ${sessionId === s.id ? 'text-indigo-900' : 'text-gray-800'}`}>
                                                {s.id.toUpperCase()}
                                            </h3>
                                            <p className="text-sm font-bold text-gray-500 mb-1">
                                                {s.name || 'Cloud Identity'}
                                            </p>
                                            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">
                                                {s.phone ? `+${s.phone}` : 'WAITING LINK...'}
                                            </p>

                                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${s.status === 'open' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                    {s.status === 'open' ? 'Active' : 'Standby'}
                                                </span>
                                                <span className="text-indigo-300 font-bold text-xs uppercase group-hover:text-indigo-500 transition-colors duration-300">Manage <span>→</span></span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-32 text-center bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
                                        <span className="text-[10rem] mb-10 block grayscale opacity-30">🤖</span>
                                        <h3 className="text-4xl font-black text-gray-300 tracking-tighter mb-4">No AI Instances Found</h3>
                                        <p className="text-gray-400 font-bold text-lg max-w-sm mx-auto leading-relaxed">Your AI fleet is currently empty. Connect a new instance to begin.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Status Card */}
                        <div className="group bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500">
                            <div className={`bg-gradient-to-r ${statusConfig.color} p-8 transition-colors duration-500`}>
                                <div className="flex items-center gap-6">
                                    <div className="bg-white/20 backdrop-blur-md rounded-[1.5rem] p-5 shadow-inner border border-white/20">
                                        <span className="text-6xl drop-shadow-2xl">{statusConfig.icon}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Session Intel</h2>
                                        <p className="text-white/90 font-bold mt-1.5 uppercase text-sm tracking-[0.25em]">{statusConfig.label}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10">
                                <div className="space-y-5">
                                    {[
                                        { label: 'Auth Status', value: connectionState.status, type: 'status' },
                                        { label: 'Cloud Identity', value: connectionState.user?.name || 'Guest Instance', type: 'name' },
                                        { label: 'Registered ID', value: connectionState.phoneNumber ? `+${connectionState.phoneNumber}` : 'Unidentified', type: 'id' }
                                    ].map((item: any, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-6 bg-gray-50/80 rounded-[2rem] border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300">
                                            <span className="text-gray-500 font-black uppercase text-xs tracking-[0.25em]">{item.label}</span>
                                            <span className={`font-black text-lg ${item.type === 'status' && displayStatus === 'ready' ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* QR Code & Pairing Card */}
                        <div className={`group bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500 ${sessionId === 'wa-bot-ai' ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-white/20 backdrop-blur-md rounded-[1.5rem] p-5 shadow-inner border border-white/20">
                                            <span className="text-6xl drop-shadow-2xl">🔗</span>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tight">Device Linking</h2>
                                            <p className="text-white/90 font-bold mt-1.5 uppercase text-sm tracking-[0.25em]">Connect Mobile Portal</p>
                                        </div>
                                    </div>

                                    {/* Link Mode Toggle */}
                                    <div className="bg-black/20 backdrop-blur-xl p-2 rounded-[2rem] flex gap-2 border border-white/10 self-start">
                                        <button
                                            onClick={() => setLinkMode('qr')}
                                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${linkMode === 'qr' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white/60 hover:text-white'}`}
                                        >
                                            QR CODE
                                        </button>
                                        <button
                                            onClick={() => setLinkMode('phone')}
                                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${linkMode === 'phone' ? 'bg-white text-purple-600 shadow-xl' : 'text-white/60 hover:text-white'}`}
                                        >
                                            PHONE NUMBER
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 flex flex-col items-center justify-center min-h-[420px]">
                                {loading ? (
                                    <div className="animate-pulse text-center">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full mb-4 mx-auto"></div>
                                        <p className="font-black text-gray-400">Syncing...</p>
                                    </div>
                                ) : displayStatus === 'ready' ? (
                                    <div className="text-center animate-bounce-in">
                                        <span className="text-[10rem] mb-6 block drop-shadow-2xl transition-transform hover:scale-110 duration-500 cursor-pointer">🌿</span>
                                        <h3 className="text-5xl font-black text-emerald-900 tracking-tighter mb-2">Verified</h3>
                                        <p className="text-emerald-600 font-bold uppercase tracking-[0.3em] text-xs">READY FOR TRANSMISSION</p>
                                    </div>
                                ) : linkMode === 'qr' ? (
                                    <>
                                        {connectionState.qrImage ? (
                                            <div className="relative p-10 bg-white rounded-[4rem] shadow-[-20px_20px_60px_#bebebe,20px_-20px_60px_#ffffff] border-[12px] border-gray-50 transform hover:scale-105 transition-transform duration-500 group">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem]"></div>
                                                <img src={connectionState.qrImage} alt="QR Code" className="w-64 h-64 rounded-2xl relative z-10" />
                                                <div className="mt-8 text-center relative z-10">
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-1">SCAN VIA WHATSAPP</p>
                                                    <p className="text-gray-400 text-xs font-bold">Expires in 20 seconds</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center group">
                                                <div className="w-48 h-48 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-10 mx-auto group-hover:bg-gray-100 transition-colors duration-500 shadow-inner">
                                                    <span className="text-[6rem] opacity-20 filter grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700">📶</span>
                                                </div>
                                                <p className="font-black uppercase tracking-[0.3em] text-gray-300 group-hover:text-gray-400 transition-colors">Awaiting Signal...</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full max-w-sm space-y-8 animate-fade-in">
                                        {pairingCode ? (
                                            <div className="text-center space-y-8">
                                                <div className="bg-purple-50 rounded-[2.5rem] p-10 border-4 border-dashed border-purple-200">
                                                    <p className="text-xs font-black text-purple-400 uppercase tracking-[0.4em] mb-6">YOUR PAIRING CODE</p>
                                                    <div className="flex items-center justify-center gap-3">
                                                        {pairingCode.split('').map((char, i) => (
                                                            <div key={i} className={`w-12 h-16 flex items-center justify-center bg-white rounded-2xl shadow-xl text-3xl font-black ${char === '-' ? 'bg-transparent shadow-none text-purple-300 w-6' : 'text-purple-600 border border-purple-100'}`}>
                                                                {char}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 font-bold text-sm leading-relaxed px-4">
                                                    Input this code on your phone:<br />
                                                    <span className="text-gray-400 font-medium">WhatsApp Account &rarr; Linked Devices &rarr; Link with phone number instead</span>
                                                </p>
                                                <button
                                                    onClick={() => { setPairingCode(null); setLinkMode('qr'); }}
                                                    className="text-purple-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-purple-700 transition-colors"
                                                >
                                                    &larr; BACK TO QR MODE
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">WhatsApp Number</label>
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            placeholder="62812345678"
                                                            value={pairingPhone}
                                                            onChange={(e) => setPairingPhone(e.target.value)}
                                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-8 py-5 text-xl font-black focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-gray-300"
                                                        />
                                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl group-hover:scale-110 transition-transform">📱</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleInitWithPhone}
                                                    disabled={requestingCode || !pairingPhone}
                                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-5 rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(79,70,229,0.5)] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale tracking-[0.2em] text-sm"
                                                >
                                                    {requestingCode ? 'GENERATING...' : 'GET PAIRING CODE &rarr;'}
                                                </button>
                                                <p className="text-center text-[10px] text-gray-400 font-bold tracking-widest italic opacity-60">
                                                    Code will be valid for 2 minutes
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Manual Response Card */}
                    {displayStatus === 'ready' && sessionId !== 'wa-bot-ai' && (
                        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 mt-12 animate-in slide-in-from-bottom-5">
                            <div className="bg-gradient-to-r from-[#075e54] to-[#128c7e] p-10">
                                <div className="flex items-center gap-8">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                        <span className="text-6xl">⚡</span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight">Direct Terminal</h2>
                                        <p className="text-white/80 font-bold mt-1.5 uppercase text-sm tracking-widest">Send prioritized manual response</p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSendMessage} className="p-12 space-y-10">
                                {sendResult && (
                                    <div className={`p-8 rounded-[2.5rem] flex items-center gap-6 animate-slide-up ${sendResult.success ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-red-50 border-2 border-red-200'}`}>
                                        <div className="text-4xl">{sendResult.success ? '✨' : '💥'}</div>
                                        <p className="font-black text-xl">{sendResult.message}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Destination JID</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={sendForm.phone}
                                            onChange={handleFormChange}
                                            placeholder="62812345678"
                                            className="w-full px-8 py-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black text-2xl transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Data Payload</label>
                                        <textarea
                                            name="message"
                                            value={sendForm.message}
                                            onChange={handleFormChange}
                                            placeholder="Type message..."
                                            rows={2}
                                            className="w-full px-8 py-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-xl transition-all resize-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full py-8 bg-[#25d366] hover:bg-[#075e54] text-white rounded-[2.5rem] font-black text-2xl tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                                >
                                    {sending ? 'TRANSMITTING...' : 'EXECUTE RESPONSE 🚀'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WhatsAppConnector;
