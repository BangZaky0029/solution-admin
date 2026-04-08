// =========================================
// src/pages/UserInsights.tsx
// Admin Page for Acquisition & Feedback Analytics
// =========================================

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  Tooltip, Legend
} from 'recharts';
import api from '../api/api';
import {
  Users,
  Download,
  Search,
  Star,
  MessageCircle,
  Send,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';


import { useUIStore } from '../stores/uiStore';
import { motion } from 'framer-motion';


interface AcquisitionStat {
  source: string;
  count: number;
}

interface UserFeedback {
  id: number;
  user_id: number;
  rating: number;
  comment: string;
  admin_reply?: string;
  admin_reply_at?: string;
  is_hidden: number;
  updated_at: string;

  user_name: string;
  user_email: string;
}


const UserInsights: React.FC = () => {
  const [acquisitionData, setAcquisitionData] = useState<AcquisitionStat[]>([]);
  const [feedbackData, setFeedbackData] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useUIStore();


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchData();
  }, []);

  const [filterRating, setFilterRating] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [acqRes, feedRes] = await Promise.all([
        api.get<{ success: boolean; data: AcquisitionStat[] }>('/surveys/admin/stats/acquisition'),
        api.get<{ success: boolean; data: UserFeedback[] }>('/surveys/admin/stats/feedback')
      ]);

      if (acqRes.data.success) setAcquisitionData(acqRes.data.data);
      if (feedRes.data.success) setFeedbackData(feedRes.data.data);
    } catch (error) {
      console.error('Failed to fetch insights data', error);
    } finally {
      setLoading(false);
    }
  };


  const handleExportCSV = () => {
    if (!feedbackData.length) return;

    const headers = ['User', 'Email', 'Rating', 'Comment', 'Date'];
    const csvContent = [
      headers.join(','),
      ...feedbackData.map(f => [
        `"${f.user_name}"`,
        `"${f.user_email}"`,
        f.rating,
        `"${f.comment.replace(/"/g, '""')}"`,
        new Date(f.updated_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `user_feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<number | null>(null);

  const handleReplySubmit = async (feedbackId: number) => {
    const text = replyText[feedbackId];
    if (!text) return;

    setSubmittingReply(feedbackId);
    try {
      const res = await api.post(`/surveys/admin/reply/${feedbackId}`, { reply: text });
      if (res.data.success) {
        // Update local state
        setFeedbackData(prev => prev.map(f => 
          f.id === feedbackId 
            ? { ...f, admin_reply: text, admin_reply_at: new Date().toISOString() } 
            : f
        ));
        setReplyText(prev => ({ ...prev, [feedbackId]: '' }));
      }
    } catch (error) {
      console.error('Failed to submit reply', error);
      alert('Gagal mengirim balasan');
    } finally {
      setSubmittingReply(null);
    }
  };

  const handleReplyDelete = async (feedbackId: number) => {
    if (!window.confirm('Hapus balasan ini?')) return;
    try {
      const res = await api.delete(`/surveys/admin/reply/${feedbackId}`);
      if (res.data.success) {
        setFeedbackData(prev => prev.map(f => 
          f.id === feedbackId ? { ...f, admin_reply: undefined, admin_reply_at: undefined } : f
        ));
      }
    } catch (error) {
       console.error('Failed to delete reply', error);
    }
  };

  const handleToggleHide = async (feedbackId: number) => {
    const feedback = feedbackData.find(f => f.id === feedbackId);
    if (!feedback) return;

    try {
      const res = await api.patch(`/surveys/admin/feedback/${feedbackId}/hide`);
      if (res.data.success) {
        const isNowHidden = res.data.is_hidden;
        setFeedbackData(prev => prev.map(f => 
          f.id === feedbackId ? { ...f, is_hidden: isNowHidden } : f
        ));

        addNotification({
          type: isNowHidden ? 'warning' : 'success',
          title: isNowHidden ? 'Feedback Tersembunyi' : 'Feedback Ditampilkan',
          message: `Komentar user "${feedback.user_name}" telah ${isNowHidden ? 'di hidden' : 'di buka'}`
        });
      }
    } catch (error) {
       console.error('Failed to toggle visibility', error);
       addNotification({
         type: 'error',
         title: 'Gagal',
         message: 'Gagal mengubah visibilitas ulasan'
       });
    }
  };


  const toggleExpand = (id: number) => {

    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFeedback = feedbackData.filter(f => {
    const matchesSearch = f.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === null || f.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading insights...</div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-screen animate-fade-in bg-slate-50/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Insights</h1>
          <p className="text-slate-500 font-medium">Analitik sumber user dan feedback layanan</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acquisition Stats */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-50 p-2.5 rounded-xl">
              <Users size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Acquisition Channel</h2>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={acquisitionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string, percent?: number }) => 
                    name ? `${name} ${((percent || 0) * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="source"
                  animationDuration={1500}
                >
                  {acquisitionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aggregate Feedback Score */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2.5 rounded-xl">
                <Star size={20} className="text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">User Feedbacks</h2>
            </div>
            
            {/* Star Rating Filter */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto">
              <button 
                onClick={() => setFilterRating(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterRating === null ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Semua
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(star)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 ${filterRating === star ? 'bg-white text-amber-500 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className="text-xs font-bold">{star}</span>
                  <Star size={12} className={filterRating === star ? 'fill-amber-500' : ''} />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari user atau saran..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 w-[150px]">User</th>
                  <th className="py-4 px-2 text-center w-[80px]">Rating</th>
                  <th className="py-4 px-4 text-center w-[120px]">Waktu</th>
                  <th className="py-4 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFeedback.map((item) => (
                  <React.Fragment key={item.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-all group ${expandedId === item.id ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50'} ${item.is_hidden ? 'opacity-50 grayscale-[0.5]' : ''}`}
                    >
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-slate-800 text-sm truncate max-w-[120px]" title={item.user_name}>{item.user_name}</div>
                          {item.is_hidden === 1 && <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full uppercase">Hidden</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]" title={item.user_email}>{item.user_email}</div>
                      </td>

                      <td className="py-6 px-2">
                        <div className="flex justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              size={10}
                              className={s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {new Date(item.updated_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleHide(item.id)}
                            title={item.is_hidden ? "Tampilkan di Home" : "Sembunyikan dari Home"}
                            className={`p-2 rounded-xl transition-all active:scale-90 ${item.is_hidden ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                          >
                            {item.is_hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className={`
                              px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all
                              ${expandedId === item.id 
                                ? 'bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100' 
                                : item.admin_reply 
                                  ? 'bg-green-50 text-green-600 ring-1 ring-green-100 hover:bg-green-100'
                                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700'
                              }
                            `}
                          >
                            {expandedId === item.id ? 'Tutup' : item.admin_reply ? 'Lihat Balasan' : 'Beri Balasan'}
                          </button>
                        </div>
                      </td>

                    </motion.tr>

                    {/* Expandable Detail Section */}
                    {expandedId === item.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-indigo-50/20"
                      >
                        <td colSpan={4} className="px-8 pb-8 pt-2">
                          <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-6">
                            {/* User Comment */}
                            <div>
                               <div className="flex items-center gap-2 mb-3">
                                 <MessageCircle size={14} className="text-slate-400" />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pesan dari User</span>
                               </div>
                               <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap italic">
                                 "{item.comment}"
                               </p>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Admin Reply & Input */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               {/* Current Reply Display */}
                               <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Status Balasan</span>
                                    </div>
                                    {item.admin_reply && (
                                      <button 
                                        onClick={() => handleReplyDelete(item.id)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Hapus Balasan"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>

                                  {item.admin_reply ? (
                                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/30">
                                       <p className="text-xs text-indigo-700 font-bold leading-relaxed italic">
                                         {item.admin_reply}
                                       </p>
                                       <div className="mt-3 text-[9px] text-indigo-300 font-bold">
                                         TERKIRIM PADA {new Date(item.admin_reply_at || '').toLocaleString().toUpperCase()}
                                       </div>
                                    </div>
                                  ) : (
                                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center">
                                       <p className="text-[10px] text-slate-400 font-bold italic">Belum ada balasan untuk feedback ini.</p>
                                    </div>
                                  )}
                               </div>

                               {/* Form Input */}
                               <div className="space-y-3">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Send size={14} className="text-indigo-600" />
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tulis Tanggapan</span>
                                  </div>
                                  <textarea
                                    value={replyText[item.id] || ''}
                                    onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                                    placeholder={item.admin_reply ? "Ubah balasan Anda..." : "Tanggapan resmi Anda di halaman utama..."}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all resize-none h-24"
                                  />
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => handleReplySubmit(item.id)}
                                      disabled={submittingReply === item.id || !replyText[item.id]}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-indigo-100"
                                    >
                                      {submittingReply === item.id ? 'MENGIRIM...' : (item.admin_reply ? 'UPDATE BALASAN' : 'POST BALASAN')}
                                    </button>
                                  </div>
                               </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {filteredFeedback.length === 0 && (
              <div className="py-20 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium italic">Belum ada feedback yang sesuai kriteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default UserInsights;

