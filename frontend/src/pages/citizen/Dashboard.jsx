import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { alertAPI, contactAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  ACTIVE: 'bg-red-100 text-red-700',
  RESPONDER_ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  ARRIVED: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

const TYPE_ICONS = {
  medical: '🏥', accident: '🚗', fire: '🔥', crime: '🚔',
  women_safety: '👩', natural_disaster: '🌪️', other: '⚠️',
};

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, c] = await Promise.all([alertAPI.getMy(), contactAPI.getAll()]);
        setAlerts(a.data.data || []);
        setContacts(c.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeAlert = alerts.find(a => ['ACTIVE', 'RESPONDER_ASSIGNED', 'IN_PROGRESS', 'ARRIVED'].includes(a.status));
  const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold mb-1">Hello, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-blue-100 text-sm">Your emergency dashboard. Stay safe.</p>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="bg-white/10 rounded-xl px-4 py-2">
            <p className="text-2xl font-bold">{alerts.length}</p>
            <p className="text-blue-100 text-xs">Total Alerts</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2">
            <p className="text-2xl font-bold">{resolvedCount}</p>
            <p className="text-blue-100 text-xs">Resolved</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2">
            <p className="text-2xl font-bold">{contacts.length}</p>
            <p className="text-blue-100 text-xs">Emergency Contacts</p>
          </div>
        </div>
      </motion.div>

      {/* Active Alert Banner */}
      {activeAlert && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">🚨</span>
            <div>
              <p className="font-bold text-red-800">Active Emergency Alert</p>
              <p className="text-red-600 text-sm">{activeAlert.type?.replace('_', ' ').toUpperCase()} · {activeAlert.status}</p>
            </div>
          </div>
          <Link to={`/citizen/alerts/${activeAlert._id}`}
            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
            Track Live →
          </Link>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-slate-800 text-base mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/citizen/sos"
            className="bg-red-600 text-white rounded-2xl p-5 text-center hover:bg-red-700 transition-colors shadow-lg shadow-red-200 group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🚨</div>
            <p className="font-bold text-sm">SOS Alert</p>
            <p className="text-red-100 text-xs mt-0.5">Tap for help</p>
          </Link>
          <Link to="/citizen/contacts"
            className="card hover:shadow-md transition-all text-center group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📞</div>
            <p className="font-bold text-sm text-slate-800">Contacts</p>
            <p className="text-slate-500 text-xs mt-0.5">{contacts.length}/5 added</p>
          </Link>
          <Link to="/helplines"
            className="card hover:shadow-md transition-all text-center group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">☎️</div>
            <p className="font-bold text-sm text-slate-800">Helplines</p>
            <p className="text-slate-500 text-xs mt-0.5">Quick call</p>
          </Link>
          <Link to="/citizen/profile"
            className="card hover:shadow-md transition-all text-center group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
            <p className="font-bold text-sm text-slate-800">Profile</p>
            <p className="text-slate-500 text-xs mt-0.5">Edit info</p>
          </Link>
        </div>
      </div>

      {/* Emergency Contacts Preview */}
      {contacts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
          <span className="text-3xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">No emergency contacts added</p>
            <p className="text-yellow-700 text-sm">Add contacts to notify them during emergencies</p>
          </div>
          <Link to="/citizen/contacts" className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-600">
            Add Now
          </Link>
        </div>
      )}

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 text-base">Recent Alerts</h2>
        </div>
        {alerts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-4">✅</p>
            <p className="font-semibold text-slate-800">No emergencies so far</p>
            <p className="text-slate-500 text-sm mt-1">Your alert history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Link key={alert._id} to={`/citizen/alerts/${alert._id}`}
                className="card flex items-center gap-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                  {TYPE_ICONS[alert.type] || '⚠️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 capitalize">{alert.type?.replace('_', ' ')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[alert.status]}`}>
                      {alert.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{alert.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{new Date(alert.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">View →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Safety Tips */}
      <div className="card bg-blue-50 border-blue-100">
        <h3 className="font-bold text-blue-800 mb-3">💡 Safety Tips</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• Always keep your emergency contacts up to date</p>
          <p>• Enable location permissions for faster response</p>
          <p>• Set a custom emergency message in your profile</p>
          <p>• Save national emergency number: <strong>112</strong></p>
        </div>
      </div>
    </div>
  );
}
