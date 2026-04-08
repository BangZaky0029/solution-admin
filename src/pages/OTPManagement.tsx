import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  Search,
  Key,
  Clock,
  RefreshCcw,

  CheckCircle2,
  AlertCircle,
  Hash,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OTPRecord {
  id: number;
  otp_code: string;
  type: string;
  is_used: number;
  expired_at: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_phone: string;
}

const OTPManagement: React.FC = () => {
  const [otps, setOtps] = useState<OTPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOTPs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/surveys/admin/otps', {
        params: { search, type, page, limit: 10 }
      });
      if (res.data.success) {
        setOtps(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch OTPs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOTPs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, type, page]);

  const getStatusBadge = (otp: OTPRecord) => {
    const isExpired = new Date(otp.expired_at) < new Date();
    if (otp.is_used) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-500 uppercase tracking-tight">
          <CheckCircle2 size={10} /> Terpakai
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-600 uppercase tracking-tight">
          <AlertCircle size={10} /> Expired
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-600 uppercase tracking-tight">
        <ShieldCheck size={10} /> Aktif
      </span>
    );
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <Key className="text-indigo-600" size={36} />
            OTP Management
          </h1>
          <p className="text-gray-500 font-medium mt-1">Pantau dan kelola verifikasi manual user</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Cari Nama/WA/Email/OTP..."
              className="pl-12 pr-6 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-indigo-600 outline-none w-full md:w-80 shadow-sm transition-all text-sm font-bold"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="px-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-indigo-600 outline-none shadow-sm text-sm font-black text-gray-700 cursor-pointer"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            <option value="">Semua Tipe</option>
            <option value="verify">Registrasi</option>
            <option value="reset">Reset Password</option>
            <option value="delete_account">Hapus Akun</option>
          </select>

          <button
            onClick={fetchOTPs}
            className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[32px] border-4 border-gray-50 shadow-2xl shadow-indigo-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Tipe</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Kode OTP</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Waktu Expired</th>
                <th className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Dibuat Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {otps.map((otp) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={otp.id}
                    className="group hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">
                          {otp.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{otp.user_name}</p>
                          <p className="text-xs font-bold text-gray-400">{otp.user_email}</p>
                          <p className="text-[10px] font-black text-indigo-500 mt-0.5">{otp.user_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-600 uppercase">
                        {otp.type}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-xl px-4 py-2 font-mono text-lg font-black tracking-widest shadow-lg shadow-gray-200">
                        <Hash size={14} className="text-gray-500" />
                        {otp.otp_code}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(otp)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={14} />
                        <span className="text-xs font-bold">{new Date(otp.expired_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-400">
                        {new Date(otp.created_at).toLocaleString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {loading && otps.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 font-black animate-pulse">Memuat Data OTP...</p>
            </div>
          )}

          {!loading && otps.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={40} className="text-gray-200" />
              </div>
              <p className="text-gray-400 font-black">Data OTP tidak ditemukan</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500">Halaman {page} dari {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border-2 border-gray-100 rounded-xl disabled:opacity-30 hover:border-indigo-600 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white border-2 border-gray-100 rounded-xl disabled:opacity-30 hover:border-indigo-600 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default OTPManagement;
