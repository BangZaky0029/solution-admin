import { FC, useState, useMemo, useEffect } from 'react';
import {
    useFinanceSummary,
    useFinanceBreakdown,
    useRevenueTrends,
    useFinanceLogs
} from '../hooks/useFinance';
import { LoadingSpinner, Badge } from '../components/ui';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Sub-component for Search Highlighting (Stabilo effect)
const HighlightText: FC<{ text: string, highlight: string }> = ({ text, highlight }) => {
    if (!highlight || !highlight.trim()) return <span>{text}</span>;

    const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => (
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-[2px] px-0.5">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            ))}
        </span>
    );
};

const Finance: FC = () => {
    const [period, setPeriod] = useState<string>('30d');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterMethod, setFilterMethod] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [logsSearch, setLogsSearch] = useState<string>('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Fetching data
    const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary();
    const { data: breakdown, isLoading: isBreakdownLoading } = useFinanceBreakdown();
    const { data: trends, isLoading: isTrendsLoading } = useRevenueTrends(period);
    const { data: logsData = [], isLoading: isLogsLoading } = useFinanceLogs({
        status: filterStatus,
        method: filterMethod,
        startDate,
        endDate
    });

    // Reset page on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterMethod, startDate, endDate, logsSearch]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Client-side text search for logs
    const filteredLogs = useMemo(() => {
        if (!logsSearch.trim()) return logsData;
        const searchLower = logsSearch.toLowerCase();
        return logsData.filter((log: any) =>
            String(log.id).includes(logsSearch) ||
            log.user_name.toLowerCase().includes(searchLower) ||
            log.user_email.toLowerCase().includes(searchLower)
        );
    }, [logsData, logsSearch]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExportCSV = () => {
        if (filteredLogs.length === 0) return;

        const headers = ['ID', 'User', 'Email', 'Phone', 'Package', 'Amount', 'Method', 'Status', 'Date'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map((log: any) => [
                log.id,
                `"${log.user_name}"`,
                log.user_email,
                log.user_phone,
                `"${log.package_name}"`,
                log.amount,
                log.payment_method,
                log.status,
                new Date(log.created_at).toLocaleString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const PaginationControls = () => (
        <div className="p-6 bg-white border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-gray-500">
                Found <span className="text-emerald-600 font-bold">{filteredLogs.length}</span> logs
                {filteredLogs.length > 0 && ` (Showing ${Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)}-${Math.min(filteredLogs.length, currentPage * itemsPerPage)})`}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        ← Prev
                    </button>

                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (
                                totalPages <= 7 ||
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === pageNum
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                pageNum === currentPage - 2 ||
                                pageNum === currentPage + 2
                            ) {
                                return <span key={pageNum} className="text-gray-400 font-black">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );

    if (isSummaryLoading || isBreakdownLoading) {
        return <LoadingSpinner size="lg" text="Loading financial data..." icon="💰" />;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-8 md:p-10 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black mb-2">Financial Analytics</h1>
                    <p className="text-emerald-100 font-medium">Monitor your revenue, trends, and transaction health.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Revenue', value: summary?.totalRevenue, icon: '💰', color: 'from-blue-500 to-indigo-600' },
                    { label: 'Pending Revenue', value: summary?.pendingRevenue, icon: '⏳', color: 'from-amber-400 to-orange-500' },
                    { label: 'Month-to-Date', value: summary?.mtdRevenue, icon: '📈', color: 'from-emerald-500 to-teal-600' }
                ].map((item, i) => (
                    <div key={i} className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-white shadow-xl hover:scale-105 transition-transform duration-300`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-white/20 p-3 rounded-xl text-3xl">{item.icon}</div>
                            <span className="font-bold text-white/80">{item.label}</span>
                        </div>
                        <div className="text-3xl font-black">{formatCurrency(item.value || 0)}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">📈</span> Revenue Trends
                    </h2>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {[
                            { label: '30D', value: '30d' },
                            { label: '90D', value: '90d' },
                            { label: '1Y', value: '1y' }
                        ].map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${period === p.value
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} />
                            <Tooltip
                                formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Revenue']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue by Package */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-2xl">📦</span> Revenue by Package
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={breakdown?.byPackage}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {breakdown?.byPackage?.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Method */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-2xl">💳</span> Revenue by Method
                    </h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={breakdown?.byMethod}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {breakdown?.byMethod?.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filters & Transaction Logs */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Financial Logs & Reports</h2>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* New Search Input */}
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                value={logsSearch}
                                onChange={(e) => setLogsSearch(e.target.value)}
                                placeholder="Search by name, email or ID..."
                                className="w-full bg-gray-100 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-gray-100 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                            className="bg-gray-100 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">All Methods</option>
                            <option value="BCA">BCA Transfer</option>
                            <option value="QRIS">QRIS Payment</option>
                        </select>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold focus:ring-0"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold focus:ring-0"
                            />
                        </div>
                        <button
                            onClick={handleExportCSV}
                            disabled={filteredLogs.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md"
                        >
                            <span>📥</span> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-black">
                            <tr>
                                <th className="px-6 py-4 text-left">Transaction</th>
                                <th className="px-6 py-4 text-left">User Details</th>
                                <th className="px-6 py-4 text-left">Package</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Method</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLogsLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Loading logs...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">No transactions found matching the filters.</td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-400">
                                                #<HighlightText text={String(log.id)} highlight={logsSearch} />
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">
                                                <HighlightText text={log.user_name} highlight={logsSearch} />
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                <HighlightText text={log.user_email} highlight={logsSearch} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="purple">{log.package_name}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-emerald-600">{formatCurrency(log.amount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600">{log.payment_method}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                log.status === 'confirmed' ? 'success' :
                                                    log.status === 'pending' ? 'warning' : 'danger'
                                            }>
                                                {log.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {new Date(log.created_at).toLocaleDateString()}
                                            <br />
                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationControls />
            </div>
        </div>
    );
};

export default Finance;
