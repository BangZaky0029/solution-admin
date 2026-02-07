import { FC, useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../api/api';
import type { WhatsAppStatus, WhatsAppStatusConfig, SendMessageForm, SendMessageResult } from '../types';

const WhatsAppConnector: FC = () => {
    const [status, setStatus] = useState<WhatsAppStatus>('idle');
    const [qr, setQr] = useState<string | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sendForm, setSendForm] = useState<SendMessageForm>({ phone: '', message: '' });
    const [sendResult, setSendResult] = useState<SendMessageResult | null>(null);
    const [sending, setSending] = useState<boolean>(false);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_SOCKET_URL;
        const newSocket = io(socketUrl, { transports: ['websocket'] });
        setSocket(newSocket);

        newSocket.on('whatsapp-status', (data: { status: WhatsAppStatus; qr?: string }) => {
            setStatus(data.status);
            setQr(data.qr || null);
        });

        newSocket.on('connect', () => {
            console.log('🔌 Socket connected');
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleSendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setSending(true);
        setSendResult(null);

        try {
            await api.post<SendMessageResult>('/whatsapp/send-message', {
                phone: sendForm.phone,
                message: sendForm.message,
            });
            setSendResult({
                success: true,
                message: 'Message sent successfully!',
                sentTo: sendForm.phone,
            });
            setSendForm({ phone: '', message: '' });
        } catch (error) {
            console.error('Send message failed:', error);
            setSendResult({
                success: false,
                message: 'Failed to send message. Please try again.',
            });
        } finally {
            setSending(false);
        }
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setSendForm(prev => ({ ...prev, [name]: value }));
    };

    const getStatusConfig = (currentStatus: WhatsAppStatus): WhatsAppStatusConfig => {
        const configs: Record<WhatsAppStatus, WhatsAppStatusConfig> = {
            idle: { color: 'from-gray-500 to-gray-600', label: 'Idle', icon: '💤' },
            qr: { color: 'from-yellow-500 to-orange-500', label: 'Scan QR Code', icon: '📱' },
            ready: { color: 'from-green-500 to-emerald-600', label: 'Connected', icon: '✅' },
            disconnected: { color: 'from-red-500 to-pink-600', label: 'Disconnected', icon: '❌' },
            error: { color: 'from-red-600 to-red-800', label: 'Error', icon: '⚠️' },
        };
        return configs[currentStatus] || configs.idle;
    };

    const statusConfig = getStatusConfig(status);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <span className="text-5xl">💬</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">
                                WhatsApp Connector
                            </h1>
                            <p className="text-emerald-100 text-lg font-medium">
                                Connect and manage WhatsApp bot integration
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                                {status === 'ready' && (
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-ping opacity-20"></div>
                                )}
                            </div>
                        </div>

                        {/* Status Details */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Status</span>
                                <span className={`font-bold capitalize ${status === 'ready' ? 'text-green-600' :
                                    status === 'qr' ? 'text-yellow-600' :
                                        status === 'error' || status === 'disconnected' ? 'text-red-600' :
                                            'text-gray-600'
                                    }`}>
                                    {status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Socket</span>
                                <span className={`font-bold ${socket?.connected ? 'text-green-600' : 'text-red-600'}`}>
                                    {socket?.connected ? '🟢 Connected' : '🔴 Disconnected'}
                                </span>
                            </div>
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
                        {status === 'qr' && qr ? (
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-md opacity-30"></div>
                                <div className="relative bg-white p-4 rounded-2xl shadow-xl">
                                    <img src={qr} alt="QR Code" className="w-64 h-64" />
                                </div>
                                <p className="text-center mt-4 text-gray-600 font-medium">
                                    Scan this QR with WhatsApp
                                </p>
                            </div>
                        ) : status === 'ready' ? (
                            <div className="text-center">
                                <div className="inline-block bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 mb-4">
                                    <span className="text-8xl">✅</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">Connected!</p>
                                <p className="text-gray-600 mt-2">WhatsApp is ready to send messages</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 mb-4">
                                    <span className="text-8xl">💤</span>
                                </div>
                                <p className="text-xl font-bold text-gray-600">Waiting for Connection</p>
                                <p className="text-gray-500 mt-2">QR code will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Send Message Card */}
            {status === 'ready' && (
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
                                <p className="text-xs text-gray-500 mt-1">Format: 628xxxxxxxxxx</p>
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
        </div>
    );
};

export default WhatsAppConnector;
