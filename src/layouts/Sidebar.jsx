import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-blue-600' },
    { path: '/payments', label: 'Payments', icon: '💳', gradient: 'from-amber-500 to-orange-600' },
    { path: '/packages', label: 'Packages', icon: '📦', gradient: 'from-green-500 to-emerald-600' },
    { path: '/users', label: 'Users', icon: '👥', gradient: 'from-purple-500 to-purple-600' },
    { path: '/whatsapp', label: 'WhatsApp Bot', icon: '💬', gradient: 'from-green-400 to-emerald-500' }, // 🆕
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-72 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-20 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      {/* Logo Section */}
      <div className="relative p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-3 shadow-xl">
              <span className="text-3xl">🚀</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Gateway APTO
            </h2>
            <p className="text-xs text-purple-300 font-semibold mt-1">
              Admin Control Panel
            </p>
          </div>
        </div>
      </div>

      {/* Admin Profile */}
      <div className="relative p-6 border-b border-white/10">
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 hover:bg-white/10 transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm animate-pulse"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              A
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">administrator@apto.com</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative block"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full`}></div>
              )}
              
              <div className={`
                relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-white/10 backdrop-blur-sm shadow-lg' 
                  : 'hover:bg-white/5 hover:translate-x-1'
                }
              `}>
                {/* Icon with gradient background */}
                <div className={`
                  relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg group-hover:scale-110` 
                    : 'bg-white/5 group-hover:bg-white/10'
                  }
                `}>
                  {/* Glow effect */}
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-lg blur-md opacity-50`}></div>
                  )}
                  <span className="relative text-2xl">{item.icon}</span>
                </div>
                
                {/* Label */}
                <span className={`
                  font-bold text-base transition-colors
                  ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                `}>
                  {item.label}
                </span>

                {/* Arrow indicator */}
                {isActive && (
                  <span className="ml-auto text-xl animate-pulse">→</span>
                )}
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 pointer-events-none"></div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="relative p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-105"
        >
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all duration-300">
            <span className="text-2xl">🚪</span>
          </div>
          <span className="font-bold text-red-300 group-hover:text-red-200 transition-colors">
            Logout
          </span>
          <span className="ml-auto text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="relative p-4 text-center border-t border-white/10">
        <p className="text-xs text-gray-500">
          v2.1 • Made with <span className="text-red-400">♥</span>
        </p>
      </div>
    </aside>
  );
}