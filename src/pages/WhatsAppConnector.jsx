
// KODE FE 
// =========================================
  // FILE: WhatsAppConnector.jsx - FIXED
  // WhatsApp Connection Manager - Frontend
  // =========================================

  import { useState, useEffect, useRef } from 'react';
  import { io } from 'socket.io-client';
  import api from '../api/api';

  // Status normalization
  const normalizeStatus = (status) => {
    const map = {
      'ready': 'ready',
      'authenticated': 'ready',
      'qr': 'qr',
      'connecting': 'connecting',
      'initializing': 'connecting',
      'restarting': 'qr', // <- ubah jadi 'qr' supaya QR muncul
      'disconnected': 'disconnected',
      'logged_out': 'disconnected',
      'auth_failure': 'disconnected',
      'failed': 'disconnected'
    };
    return map[status] || 'disconnected';
  };


  export default function WhatsAppConnector() {
    const [status, setStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [validatePhone, setValidatePhone] = useState('');
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [error, setError] = useState(null);

    const socketRef = useRef(null);
    const isMountedRef = useRef(true);
    const reconnectTimeoutRef = useRef(null);

    useEffect(() => {
      isMountedRef.current = true;
      
      loadStatus();
      initializeSocket();

      return () => {
        isMountedRef.current = false;
        cleanupSocket();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    }, []);

    const initializeSocket = () => {
      if (socketRef.current?.connected) {
        console.log('Socket already connected');
        return;
      }

      const socket = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Socket.IO connected:', socket.id);
        setError(null);
        
        // Request current status on connect
        if (isMountedRef.current) {
          socket.emit('request-qr');
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket.IO disconnected:', reason);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect manually
          reconnectTimeoutRef.current = setTimeout(() => {
            socket.connect();
          }, 2000);
        }
      });

      socket.on('whatsapp-qr', (data) => {
        console.log('📱 QR RECEIVED:', data.status);
        if (!isMountedRef.current) return;
        
        const normalizedStatus = normalizeStatus(data.status);
        setStatus(normalizedStatus);
        
        if (normalizedStatus === 'qr' && data.qr) {
          setQrCode(data.qr);
        } else {
          setQrCode(null);
        }
      });

      socket.on('whatsapp-status', (data) => {
        console.log('📊 Status update:', data.status);
        if (!isMountedRef.current) return;
        
        const normalizedStatus = normalizeStatus(data.status);
        setStatus(normalizedStatus);
        
        if (normalizedStatus === 'ready' || normalizedStatus === 'disconnected') {
          setQrCode(null);
        }
        
        if (data.qr && normalizedStatus === 'qr') {
          setQrCode(data.qr);
        }
      });

      socket.on('whatsapp-error', (data) => {
        console.error('❌ WhatsApp error:', data.message);
        if (isMountedRef.current) {
          setError(data.message);
        }
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
        if (isMountedRef.current) {
          setError('Connection error. Retrying...');
        }
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        if (isMountedRef.current) {
          setError(null);
          loadStatus();
        }
      });

      socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error.message);
      });

      socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed');
        if (isMountedRef.current) {
          setError('Failed to reconnect to server');
        }
      });
    };

    const cleanupSocket = () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
    };

    const loadStatus = async () => {
      try {
        const response = await api.get('/whatsapp/status');
        
        if (!isMountedRef.current) return;
        
        const normalizedStatus = normalizeStatus(response.data.status);
        setStatus(normalizedStatus);
        
        if (normalizedStatus === 'qr' && response.data.qrCode) {
          setQrCode(response.data.qrCode);
        } else {
          setQrCode(null);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error loading status:', error);
        if (isMountedRef.current) {
          setStatus('disconnected');
          setQrCode(null);
          setError('Failed to load WhatsApp status');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    const handleRestart = async () => {
      if (!confirm('Restart WhatsApp connection? This will disconnect current session.')) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        await api.post('/whatsapp/restart');
        
        if (isMountedRef.current) {
          setStatus('connecting');
          setQrCode(null);
        }
        
        // Reload status after 3 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            loadStatus();
          }
        }, 3000);
      } catch (error) {
        console.error('Error restarting:', error);
        if (isMountedRef.current) {
          setError(error.response?.data?.message || 'Failed to restart WhatsApp connection');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    const handleDisconnect = async () => {
      if (!confirm('Disconnect WhatsApp? You will need to scan QR code again.')) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        await api.post('/whatsapp/disconnect');
        
        if (isMountedRef.current) {
          setStatus('disconnected');
          setQrCode(null);
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
        if (isMountedRef.current) {
          setError(error.response?.data?.message || 'Failed to disconnect WhatsApp');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    const handleSendTest = async (e) => {
      e.preventDefault();
      
      if (!testPhone || !testMessage) {
        alert('Please fill in all fields');
        return;
      }

      try {
        setSending(true);
        setError(null);
        
        const response = await api.post('/whatsapp/send-test', {
          phoneNumber: testPhone,
          message: testMessage
        });

        if (isMountedRef.current) {
          alert('✅ ' + response.data.message);
          setTestPhone('');
          setTestMessage('');
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to send message';
        if (isMountedRef.current) {
          alert('❌ ' + message);
        }
      } finally {
        if (isMountedRef.current) {
          setSending(false);
        }
      }
    };

    const handleValidate = async (e) => {
      e.preventDefault();
      
      if (!validatePhone) {
        alert('Please enter a phone number');
        return;
      }

      try {
        setValidating(true);
        setValidationResult(null);
        setError(null);
        
        const response = await api.post('/whatsapp/validate-number', {
          phoneNumber: validatePhone
        });

        if (isMountedRef.current) {
          setValidationResult(response.data);
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to validate number';
        if (isMountedRef.current) {
          alert('❌ ' + message);
        }
      } finally {
        if (isMountedRef.current) {
          setValidating(false);
        }
      }
    };

    const getStatusBadge = () => {
      switch (status) {
        case 'ready':
          return (
            <div className="flex items-center gap-3 bg-green-100 border-2 border-green-300 rounded-2xl px-6 py-3">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-black text-green-800 text-lg">✅ Connected</span>
            </div>
          );
        case 'qr':
          return (
            <div className="flex items-center gap-3 bg-yellow-100 border-2 border-yellow-300 rounded-2xl px-6 py-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="font-black text-yellow-800 text-lg">📱 Scan QR Code</span>
            </div>
          );
        case 'connecting':
          return (
            <div className="flex items-center gap-3 bg-blue-100 border-2 border-blue-300 rounded-2xl px-6 py-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-black text-blue-800 text-lg">🔄 Connecting...</span>
            </div>
          );
        default:
          return (
            <div className="flex items-center gap-3 bg-red-100 border-2 border-red-300 rounded-2xl px-6 py-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="font-black text-red-800 text-lg">❌ Disconnected</span>
            </div>
          );
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-spin opacity-75"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl">💬</span>
              </div>
            </div>
            <p className="text-gray-600 font-semibold">Loading WhatsApp connection...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-red-800">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <span className="text-5xl">💬</span>
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white mb-2">WhatsApp Connector</h1>
                  <p className="text-emerald-100 text-lg font-medium">
                    Connect WhatsApp for automatic OTP delivery
                  </p>
                </div>
              </div>

              {getStatusBadge()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">🔄</span>
                  Restart Connection
                </span>
              </button>

              {status === 'ready' && (
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="bg-red-500/80 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">🔌</span>
                    Disconnect
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {(status === 'qr' || status === 'connecting') && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="inline-block bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 mb-6">
                <span className="text-6xl">📱</span>
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-3">
                {status === 'qr' ? 'Scan QR Code' : 'Connecting...'}
              </h2>
              <p className="text-gray-600 mb-8">
                {status === 'qr' 
                  ? 'Open WhatsApp on your phone and scan this QR code'
                  : 'Please wait while we connect to WhatsApp...'}
              </p>

              {qrCode && status === 'qr' && (
                <div className="inline-block bg-white p-6 rounded-3xl shadow-xl border-4 border-green-200">
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-80 h-80"
                  />
                </div>
              )}

              {status === 'connecting' && !qrCode && (
                <div className="inline-block">
                  <div className="w-32 h-32 border-8 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
                </div>
              )}

              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 justify-center">
                  <span className="text-2xl">📝</span>
                  How to connect:
                </h3>
                <ol className="text-left text-gray-700 space-y-2 max-w-md mx-auto">
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-green-600">1.</span>
                    <span>Open WhatsApp on your phone</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-green-600">2.</span>
                    <span>Tap Menu (⋮) or Settings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-green-600">3.</span>
                    <span>Tap "Linked Devices"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-green-600">4.</span>
                    <span>Tap "Link a Device"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-bold text-green-600">5.</span>
                    <span>Scan the QR code above</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Connected Info */}
        {status === 'ready' && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 shadow-2xl text-white">
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                <span className="text-6xl">✅</span>
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2">WhatsApp Connected!</h2>
                <p className="text-green-100 text-lg">
                  Your WhatsApp is now connected and ready to send OTP messages
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Active Features:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Automatic OTP delivery via WhatsApp</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Phone number validation</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Custom message templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Real-time delivery status</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Test & Validate Section */}
        {status === 'ready' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Message */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-3">
                  <span className="text-3xl">📤</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Send Test Message</h2>
              </div>

              <form onSubmit={handleSendTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📱</span> Phone Number
                  </label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="08xxx or +628xxx"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>💬</span> Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter your test message..."
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 outline-none font-medium resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin text-xl">⏳</span>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">📤</span>
                      Send Test Message
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Validate Number */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3">
                  <span className="text-3xl">🔍</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Validate Phone Number</h2>
              </div>

              <form onSubmit={handleValidate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span>📱</span> Phone Number
                  </label>
                  <input
                    type="text"
                    value={validatePhone}
                    onChange={(e) => {
                      setValidatePhone(e.target.value);
                      setValidationResult(null);
                    }}
                    placeholder="08xxx or +628xxx"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300 outline-none font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={validating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin text-xl">⏳</span>
                      Validating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">🔍</span>
                      Validate Number
                    </span>
                  )}
                </button>
              </form>

              {validationResult && (
                <div className={`mt-6 p-6 rounded-2xl border-2 ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">
                      {validationResult.isValid ? '✅' : '❌'}
                    </span>
                    <div>
                      <p className={`font-black text-lg ${
                        validationResult.isValid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {validationResult.message}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Formatted: +{validationResult.formattedNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h3 className="font-black text-xl mb-2">Secure OTP</h3>
            <p className="text-blue-100">
              Automatic OTP delivery via WhatsApp for user verification
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
              <span className="text-4xl">⚡</span>
            </div>
            <h3 className="font-black text-xl mb-2">Real-time</h3>
            <p className="text-purple-100">
              Instant message delivery with real-time status updates
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h3 className="font-black text-xl mb-2">Validation</h3>
            <p className="text-green-100">
              Automatic phone number validation before sending messages
            </p>
          </div>
        </div>
      </div>
    );
  }