import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import api from '../api/api'
import { Send, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

export default function WhatsAppConnector() {
  const socketRef = useRef(null)

  const [status, setStatus] = useState('idle')
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Send message form
  const [sendForm, setSendForm] = useState({ phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  useEffect(() => {
    initSocket()
    loadStatus()
    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

  // =========================
  // Load initial status
  // =========================
  const loadStatus = async () => {
    try {
      const res = await api.get('/whatsapp/health')
      setStatus(res.data.status)
      setQr(res.data.qr || null)
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to load WhatsApp status')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // Socket.IO init
  // =========================
  const initSocket = () => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => console.log('✅ Socket connected'))
    socket.on('whatsapp-status', (data) => {
      console.log('📡 WA STATUS:', data)
      setStatus(data.status)
      setQr(data.qr || null)
    })
    socket.on('disconnect', () => console.log('❌ Socket disconnected'))
  }

  // =========================
  // Handle send message
  // =========================
  const handleSendMessage = async (e) => {
    e.preventDefault()
    setSending(true)
    setSendResult(null)

    try {
      const res = await api.post('/whatsapp/send-message', {
        phone: sendForm.phone,
        message: sendForm.message,
      })

      setSendResult({ success: true, message: res.data.message, sentTo: res.data.sentTo })
      setSendForm({ phone: '', message: '' })
    } catch (err) {
      setSendResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Gagal mengirim pesan',
      })
    } finally {
      setSending(false)
    }
  }

  // =========================
  // Status config
  // =========================
  const statusConfig = {
    idle: { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Idle', icon: '⏸️' },
    qr: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Awaiting Scan', icon: '📱' },
    ready: { color: 'bg-green-100 text-green-700 border-green-300', label: 'Connected', icon: '✅' },
    disconnected: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Disconnected', icon: '⚠️' },
    error: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Error', icon: '❌' },
  }
  const currentStatus = statusConfig[status] || statusConfig.idle

  // =========================
  // Render UI
  // =========================
  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Connection Status Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl">💬</div>
            <div>
              <h1 className="text-2xl font-bold text-white">WhatsApp Connector</h1>
              <p className="text-green-100 text-sm mt-1">Manage WhatsApp Connection</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="sync">
              {/* Loading */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full"
                  />
                  <p className="text-gray-600 font-medium">Initializing WhatsApp connection...</p>
                </motion.div>
              )}

              {/* Error */}
              {!loading && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h3 className="font-semibold text-red-800 mb-1">Connection Error</h3>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Status Badge */}
              {!loading && !error && (
                <motion.div key="status-badge" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 font-semibold ${currentStatus.color}`}
                  >
                    <span className="text-xl">{currentStatus.icon}</span>
                    <span>Status: {currentStatus.label}</span>
                  </motion.div>
                </motion.div>
              )}

              {/* QR */}
              {!loading && !error && status === 'qr' && qr && (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-center space-y-6"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
                    <p className="text-gray-700 font-medium mb-6">Scan QR menggunakan WhatsApp di HP Anda</p>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white p-6 rounded-2xl shadow-lg inline-block"
                    >
                      <img src={qr} alt="QR Code" className="w-72 h-72 mx-auto" />
                    </motion.div>
                    <p className="text-sm text-gray-500 mt-6">Buka WhatsApp → Settings → Linked Devices → Link a Device</p>
                  </div>
                </motion.div>
              )}

              {/* Ready */}
              {!loading && !error && status === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
                  >
                    ✓
                  </motion.div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">WhatsApp Connected Successfully</h3>
                  <p className="text-green-600">Your WhatsApp is now connected and ready to use</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">© 2026 Gateway Apto • Real-time connection via Socket.IO</p>
          </div>
        </div>

        {/* Send Message Card */}
        {!loading && status === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Send Message</h2>
                <p className="text-blue-100 text-sm mt-1">Send WhatsApp message manually</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSendMessage} className="space-y-6">
                {/* Phone Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={sendForm.phone}
                    onChange={(e) => setSendForm({ ...sendForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">Format: 08xxx atau +628xxx atau 628xxx</p>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pesan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Tulis pesan Anda di sini..."
                    value={sendForm.message}
                    onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Kirim Pesan
                    </>
                  )}
                </button>
              </form>

              {/* Send Result */}
              <AnimatePresence>
                {sendResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-6 p-4 rounded-xl border-2 flex items-start gap-3 ${
                      sendResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {sendResult.success ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-semibold ${sendResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {sendResult.success ? 'Berhasil!' : 'Gagal!'}
                      </p>
                      <p className={`text-sm mt-1 ${sendResult.success ? 'text-green-600' : 'text-red-600'}`}>
                        {sendResult.message}
                      </p>
                      {sendResult.sentTo && (
                        <p className="text-xs text-gray-600 mt-2">Terkirim ke: {sendResult.sentTo}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}