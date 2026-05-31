import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertAPI, responderAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getSocket, emitResponderStatus } from '../../services/socket';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'busy', label: 'Busy', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'offline', label: 'Offline', color: 'bg-slate-100 text-slate-600 border-slate-300' },
];

const TYPE_ICONS = { medical: '🏥', accident: '🚗', fire: '🔥', crime: '🚔', women_safety: '👩', natural_disaster: '🌪️', other: '⚠️' };

export default function ResponderDashboard() {
  const { user } = useAuth();
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [status, setStatus] = useState('available');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newAlertsBadge, setNewAlertsBadge] = useState(0);

  useEffect(() => {
    // Get location and fetch nearby alerts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          try {
            const res = await alertAPI.getNearby({ lat: latitude, lng: longitude, radius: 20 });
            setNearbyAlerts(res.data.data || []);
          } catch (err) { console.error(err); }
          setLoading(false);
        },
        () => { setLoading(false); }
      );
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for new SOS alerts
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewAlert = (data) => {
      setNearbyAlerts(prev => [data.alert, ...prev]);
      setNewAlertsBadge(c => c + 1);
      toast.custom(() => (
        <div className="bg-orange-500 text-white px-5 py-4 rounded-xl shadow-xl flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold">SOS Received!</p>
            <p className="text-xs opacity-90">{data.alert?.type?.replace('_', ' ')} emergency nearby</p>
          </div>
        </div>
      ));
    };

    socket.on('SOS_RECEIVED', handleNewAlert);
    socket.on('NEW_EMERGENCY_ALERT', handleNewAlert);

    return () => {
      socket.off('SOS_RECEIVED', handleNewAlert);
      socket.off('NEW_EMERGENCY_ALERT', handleNewAlert);
    };
  }, []);

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await responderAPI.updateStatus({ availability: newStatus });
      emitResponderStatus(newStatus);
      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingStatus(false); }
  };

  const activeAlerts = nearbyAlerts.filter(a => a.status === 'ACTIVE');
  const inProgressAlerts = nearbyAlerts.filter(a => ['RESPONDER_ASSIGNED', 'IN_PROGRESS', 'ARRIVED'].includes(a.status));

  return (
    <div className="space-y-6">
      {/* Welcome + Status */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <h1 className="text-xl font-bold mb-1">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-orange-100 text-sm mb-4">Responder Dashboard</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              status === 'available' ? 'bg-green-500' : status === 'busy' ? 'bg-yellow-500' : 'bg-slate-500'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
        </motion.div>

        <div className="card">
          <p className="font-semibold text-slate-700 mb-3 text-sm">Update Status</p>
          <div className="space-y-2">
            {STATUS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => updateStatus(opt.value)} disabled={updatingStatus}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  status === opt.value ? opt.color : 'border-slate-100 text-slate-500 hover:border-slate-200'
                }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${opt.value === 'available' ? 'bg-green-500' : opt.value === 'busy' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                {opt.label}
                {status === opt.value && <span className="ml-auto text-xs">✓ Current</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-red-600">{activeAlerts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Active Alerts</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-orange-600">{inProgressAlerts.length}</p>
          <p className="text-xs text-slate-500 mt-1">In Progress</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold text-blue-600">{nearbyAlerts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Nearby Total</p>
        </div>
      </div>

      {/* Map Link */}
      <Link to="/responder/map"
        className="flex items-center justify-between card bg-blue-50 border-blue-100 hover:shadow-md transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">🗺️</div>
          <div>
            <p className="font-semibold text-slate-800">Open Live Map</p>
            <p className="text-slate-500 text-xs">View all nearby emergencies on map</p>
          </div>
        </div>
        <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
      </Link>

      {/* Active Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 text-base">Active Nearby Alerts</h2>
          {newAlertsBadge > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">{newAlertsBadge} new</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>
        ) : activeAlerts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-4">✅</p>
            <p className="font-semibold text-slate-800">No active emergencies nearby</p>
            <p className="text-slate-500 text-sm mt-1">You're all clear. Stay ready!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <motion.div key={alert._id} layout
                className="card border-l-4 border-red-500 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl">
                      {TYPE_ICONS[alert.type] || '⚠️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 capitalize">{alert.type?.replace('_', ' ')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{alert.severity}</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{alert.address}</p>
                      <p className="text-slate-400 text-xs mt-1">{alert.citizenName} · {new Date(alert.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link to={`/citizen/alerts/${alert._id}`}
                      className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors text-center">
                      Respond
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
