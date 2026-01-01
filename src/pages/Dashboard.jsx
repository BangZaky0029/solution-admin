import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    confirmedPayments: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadStats();
    setGreetingMessage();
  }, []);

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const loadStats = async () => {
    try {
      const [paymentsRes] = await Promise.all([
        api.get('/admin/payments')
      ]);
      
      setStats({
        totalPayments: paymentsRes.data.length,
        pendingPayments: paymentsRes.data.length,
        confirmedPayments: 0,
        totalUsers: 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color, gradient, delay }) => (
    <div 
      className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      style={{ animationDelay: delay }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-90`}></div>
      
      {/* Floating circles decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
      
      {/* Content */}
      <div className="relative p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
            <span className="text-4xl">{icon}</span>
          </div>
        </div>
        
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-4xl font-bold mb-2">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <span className="tabular-nums">{value}</span>
            )}
          </p>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <span>↗</span>
            <span>Live Data</span>
          </div>
        </div>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
    </div>
  );

  const QuickActionCard = ({ href, icon, title, description, color }) => (
    <a
      href={href}
      className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-transparent hover:-translate-y-1"
    >
      <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative flex items-start gap-4">
        <div className={`${color} bg-opacity-10 rounded-xl p-4 group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-4xl">{icon}</span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-purple-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        
        <div className="text-2xl text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300">
          →
        </div>
      </div>
    </a>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-10 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-5 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-5 transform -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            style={{
              width: Math.random() * 8 + 4 + 'px',
              height: Math.random() * 8 + 4 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 6 + 8}s linear infinite`,
              animationDelay: Math.random() * 3 + 's'
            }}
          />
        ))}
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-6xl animate-wave">👋</span>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                {greeting}, Admin!
              </h1>
              <p className="text-purple-200 text-lg font-medium">
                Welcome back to Gateway APTO Control Center
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white flex items-center gap-2">
              <span className="text-xl">🕐</span>
              <span className="font-medium">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="💰"
          title="Total Payments"
          value={stats.totalPayments}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          delay="0s"
        />
        <StatCard
          icon="⏳"
          title="Pending Payments"
          value={stats.pendingPayments}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          delay="0.1s"
        />
        <StatCard
          icon="✅"
          title="Confirmed"
          value={stats.confirmedPayments}
          gradient="bg-gradient-to-br from-emerald-500 to-green-700"
          delay="0.2s"
        />
        <StatCard
          icon="👥"
          title="Total Users"
          value={stats.totalUsers}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          delay="0.3s"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-3">
            <span className="text-3xl">⚡</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            href="/payments"
            icon="💳"
            title="View Payments"
            description="Manage pending confirmations"
            color="bg-blue-500"
          />
          <QuickActionCard
            href="/packages"
            icon="📦"
            title="Manage Packages"
            description="Create and edit packages"
            color="bg-green-500"
          />
          <QuickActionCard
            href="/users"
            icon="👥"
            title="View Users"
            description="Manage user accounts"
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Activity & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-3">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          </div>
          
          <div className="text-center py-12">
            <div className="inline-block bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 mb-4">
              <span className="text-6xl">📋</span>
            </div>
            <p className="text-gray-600 font-medium">No recent activity</p>
            <p className="text-sm text-gray-400 mt-2">Activity will appear here</p>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3">
              <span className="text-2xl">💻</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">System Status</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'API Server', status: 'Operational', color: 'bg-green-500' },
              { label: 'Database', status: 'Operational', color: 'bg-green-500' },
              { label: 'Payment Gateway', status: 'Operational', color: 'bg-green-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${item.color} rounded-full animate-pulse`}></div>
                  <span className="font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm text-green-600 font-semibold">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-wave {
          animation: wave 2s ease-in-out infinite;
          display: inline-block;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}