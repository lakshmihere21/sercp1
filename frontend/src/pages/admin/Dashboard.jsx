import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { analyticsAPI, alertAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const createIcon = (emoji, size = 28) => L.divIcon({
  html: `<div style="font-size:${size}px;line-height:1">${emoji}</div>`,
  className: 'bg-transparent border-none',
  iconAnchor: [size / 2, size],
});

const TYPE_ICONS = { medical: '🏥', accident: '🚗', fire: '🔥', crime: '🚔', women_safety: '👩', natural_disaster: '🌪️', other: '⚠️' };

const STATUS_COLORS = {
  ACTIVE: 'bg-red-100 text-red-700 border-red-200',
  RESPONDER_ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-orange-100 text-orange-700 border-orange-200',
  ARRIVED: 'bg-purple-100 text-purple-700 border-purple-200',
  RESOLVED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          alertAPI.getAll({ status: 'ACTIVE', limit: 20 }),
        ]);
        setStats(statsRes.data.data);
        setLiveAlerts(alertsRes.data.data || []);
      } catch (err) { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('NEW_EMERGENCY_ALERT', ({ alert }) => {
      setLiveAlerts(prev => [alert, ...prev]);
      if (stats) setStats(prev => ({ ...prev, overview: { ...prev.overview, activeAlerts: (prev.overview.activeAlerts || 0) + 1 } }));
    });

    socket.on('ALERT_STATUS_UPDATED', ({ alertId, status }) => {
      setLiveAlerts(prev => prev.map(a => a._id === alertId ? { ...a, status } : a));
    });

    socket.on('TRACK_USER', (data) => {
      setLiveLocations(prev => ({ ...prev, [data.userId]: data }));
    });

    socket.on('ONLINE_COUNT', ({ count }) => setOnlineCount(count));

    return () => {
      socket.off('NEW_EMERGENCY_ALERT');
      socket.off('ALERT_STATUS_UPDATED');
      socket.off('TRACK_USER');
      socket.off('ONLINE_COUNT');
    };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;

  const ov = stats?.overview || {};

  const STAT_CARDS = [
    { label: 'Active Alerts', value: ov.activeAlerts || 0, icon: '🚨', color: 'bg-red-50 text-red-600', border: 'border-red-100' },
    { label: 'Total Today', value: ov.todayAlerts || 0, icon: '📋', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
    { label: 'Resolved', value: ov.resolvedAlerts || 0, icon: '✅', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
    { label: 'Responders', value: ov.availableResponders || 0, icon: '🛡️', color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
    { label: 'Total Users', value: ov.totalUsers || 0, icon: '👥', color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
    { label: 'Online Now', value: onlineCount, icon: '🟢', color: 'bg-teal-50 text-teal-600', border: 'border-teal-100' },
    { label: 'Avg Response', value: `${stats?.avgResponseTimeMinutes || 0}m`, icon: '⚡', color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
    { label: 'Total Alerts', value: ov.totalAlerts || 0, icon: '📊', color: 'bg-slate-50 text-slate-600', border: 'border-slate-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Command Center</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-500">Live · All systems operational</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/analytics" className="btn-outline text-sm py-2">📊 Analytics</Link>
          <Link to="/admin/alerts" className="btn-primary text-sm py-2">🚨 All Alerts</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STAT_CARDS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-white rounded-2xl p-4 shadow-sm border ${s.border}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.color}`}>LIVE</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Map + Alert Queue */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Live Map */}
        <div className="lg:col-span-3 h-80 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <MapContainer center={[19.076, 72.877]} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {liveAlerts.map(alert => {
              const lat = alert.location?.coordinates?.[1];
              const lng = alert.location?.coordinates?.[0];
              if (!lat || !lng) return null;
              return (
                <Marker key={alert._id} position={[lat, lng]} icon={createIcon(TYPE_ICONS[alert.type] || '⚠️', 28)}>
                  <Popup>
                    <p className="font-bold text-sm">{alert.type?.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-xs text-red-600">{alert.severity}</p>
                    <p className="text-xs">{alert.citizenName}</p>
                  </Popup>
                </Marker>
              );
            })}
            {Object.values(liveLocations).map(loc => (
              <Marker key={loc.userId} position={[loc.latitude, loc.longitude]} icon={createIcon(loc.role === 'responder' ? '🛡️' : '📍', 24)}>
                <Popup>{loc.name} ({loc.role})</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Emergency Queue */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate-800">Emergency Queue</p>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
              {liveAlerts.filter(a => a.status === 'ACTIVE').length} Active
            </span>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1 max-h-64">
            {liveAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">No active emergencies</p>
              </div>
            ) : liveAlerts.map(alert => (
              <Link key={alert._id} to={`/admin/alerts`}
                className={`flex items-start gap-2 p-3 rounded-xl border transition-all hover:shadow-sm ${STATUS_COLORS[alert.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                <span className="text-lg">{TYPE_ICONS[alert.type] || '⚠️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs capitalize">{alert.type?.replace('_', ' ')}</p>
                  <p className="text-xs opacity-70 truncate">{alert.address}</p>
                  <p className="text-xs opacity-60">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                </div>
                <span className="text-xs font-bold shrink-0">{alert.severity}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Type Breakdown */}
      {stats?.byType && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Emergency Type Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">{TYPE_ICONS[type] || '⚠️'}</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{count}</p>
                  <p className="text-xs text-slate-500 capitalize">{type.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/admin/alerts', icon: '🚨', label: 'Manage Alerts', desc: 'View all emergencies', color: 'bg-red-50 border-red-100' },
          { to: '/admin/users', icon: '👥', label: 'Manage Users', desc: 'Citizens & responders', color: 'bg-blue-50 border-blue-100' },
          { to: '/admin/resources', icon: '🚗', label: 'Resources', desc: 'Vehicles & responders', color: 'bg-orange-50 border-orange-100' },
          { to: '/admin/analytics', icon: '📊', label: 'Analytics', desc: 'Charts & reports', color: 'bg-purple-50 border-purple-100' },
        ].map(card => (
          <Link key={card.to} to={card.to}
            className={`card ${card.color} hover:shadow-md transition-all group`}>
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{card.icon}</div>
            <p className="font-semibold text-slate-800 text-sm">{card.label}</p>
            <p className="text-slate-500 text-xs mt-0.5">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
