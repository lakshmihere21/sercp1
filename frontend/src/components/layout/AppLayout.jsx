import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const citizenNav = [
  { path: '/citizen', label: 'Dashboard', icon: '🏠', exact: true },
  { path: '/citizen/sos', label: 'SOS Alert', icon: '🚨' },
  { path: '/citizen/contacts', label: 'Emergency Contacts', icon: '📞' },
  { path: '/helplines', label: 'Helplines', icon: '☎️', external: true },
  { path: '/citizen/profile', label: 'Profile', icon: '👤' },
];

const responderNav = [
  { path: '/responder', label: 'Dashboard', icon: '🏠', exact: true },
  { path: '/responder/map', label: 'Live Map', icon: '🗺️' },
  { path: '/responder/profile', label: 'Profile', icon: '👤' },
];

const adminNav = [
  { path: '/admin', label: 'Command Center', icon: '🖥️', exact: true },
  { path: '/admin/alerts', label: 'All Alerts', icon: '🚨' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/resources', label: 'Resources', icon: '🚗' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
];

const roleNav = { citizen: citizenNav, responder: responderNav, volunteer: responderNav, admin: adminNav };

const roleColors = {
  citizen: 'bg-blue-600', responder: 'bg-orange-600',
  volunteer: 'bg-green-600', admin: 'bg-purple-600',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { onlineCount, newAlerts } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const nav = roleNav[user?.role] || citizenNav;
  const roleColor = roleColors[user?.role] || 'bg-blue-600';

  const isActive = (item) => item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const unreadAlerts = newAlerts.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">S</div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">SERCP</p>
              <p className="text-xs text-slate-400">Emergency Response</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${roleColor} flex items-center justify-center text-white font-bold text-sm`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{user?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full text-white ${roleColor}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            item.external ? (
              <Link key={item.path} to={item.path}
                className={isActive(item) ? 'sidebar-link-active' : 'sidebar-link'}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ) : (
              <Link key={item.path} to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={isActive(item) ? 'sidebar-link-active' : 'sidebar-link'}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          ))}
        </nav>

        {/* Online Status */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-500">{onlineCount} online</span>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <div className="w-5 h-0.5 bg-slate-700 mb-1" />
              <div className="w-5 h-0.5 bg-slate-700 mb-1" />
              <div className="w-5 h-0.5 bg-slate-700" />
            </button>
            <h1 className="font-semibold text-slate-800 text-base hidden sm:block">
              {nav.find(n => isActive(n))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* SOS Quick Button for citizen */}
            {user?.role === 'citizen' && (
              <Link to="/citizen/sos"
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">
                🚨 <span className="hidden sm:inline">SOS</span>
              </Link>
            )}

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <span className="text-xl">🔔</span>
                {unreadAlerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 flex justify-between">
                      <p className="font-semibold text-slate-800">Recent Alerts</p>
                      <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>
                    {unreadAlerts.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <p className="text-3xl mb-2">🔕</p>
                        <p className="text-sm">No new alerts</p>
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto">
                        {unreadAlerts.map((a, i) => (
                          <div key={i} className="p-4 border-b border-slate-50 hover:bg-slate-50">
                            <p className="text-sm font-semibold text-slate-800">🚨 {a?.type?.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-xs text-slate-500 mt-1 truncate">{a?.address}</p>
                            <p className="text-xs text-red-600 font-medium mt-1">{a?.severity}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
