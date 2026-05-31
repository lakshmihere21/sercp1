import { useState, useEffect } from 'react';
import { alertAPI, responderAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  ACTIVE: 'bg-red-100 text-red-700', RESPONDER_ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700', ARRIVED: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700', CANCELLED: 'bg-slate-100 text-slate-500',
};
const TYPE_ICONS = { medical: '🏥', accident: '🚗', fire: '🔥', crime: '🚔', women_safety: '👩', natural_disaster: '🌪️', other: '⚠️' };

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', type: '', severity: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [responders, setResponders] = useState([]);
  const [assignId, setAssignId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filter).filter(([, v]) => v)) };
      const res = await alertAPI.getAll(params);
      setAlerts(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);

  useEffect(() => {
    responderAPI.getAvailable().then(res => setResponders(res.data.data || [])).catch(() => {});
  }, []);

  const handleAssign = async (alertId) => {
    if (!assignId) return toast.error('Select a responder');
    setAssigning(true);
    try {
      await alertAPI.assign(alertId, { responderId: assignId });
      toast.success('Responder assigned!');
      setSelected(null);
      setAssignId('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed'); }
    finally { setAssigning(false); }
  };

  const handleStatus = async (alertId, status) => {
    try {
      await alertAPI.updateStatus(alertId, { status });
      toast.success(`Status updated to ${status}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">All Emergencies</h1>
        <p className="text-slate-500 text-sm">{total} total alerts</p>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
          className="input-field w-auto text-sm py-2">
          <option value="">All Status</option>
          {['ACTIVE', 'RESPONDER_ASSIGNED', 'IN_PROGRESS', 'ARRIVED', 'RESOLVED', 'CANCELLED'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))}
          className="input-field w-auto text-sm py-2">
          <option value="">All Types</option>
          {['medical', 'accident', 'fire', 'crime', 'women_safety', 'natural_disaster', 'other'].map(t => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={filter.severity} onChange={e => setFilter(p => ({ ...p, severity: e.target.value }))}
          className="input-field w-auto text-sm py-2">
          <option value="">All Severity</option>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => setFilter({ status: '', type: '', severity: '' })}
          className="text-sm text-slate-500 hover:text-slate-700 underline">Clear</button>
      </div>

      {/* Alert Table */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-2xl mb-3">📋</p>
              <p className="font-semibold text-slate-800">No alerts found</p>
            </div>
          ) : alerts.map(alert => (
            <motion.div key={alert._id} layout className="card hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {TYPE_ICONS[alert.type] || '⚠️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-slate-800 capitalize">{alert.type?.replace('_', ' ')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[alert.status] || ''}`}>
                      {alert.status?.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{alert.severity}</span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{alert.address}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span>👤 {alert.citizen?.name || alert.citizenName}</span>
                    <span>📞 {alert.citizen?.phone || alert.citizenPhone}</span>
                    <span>🕐 {new Date(alert.createdAt).toLocaleString()}</span>
                    {alert.assignedResponder && <span>🛡️ {alert.assignedResponder.name}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {alert.status === 'ACTIVE' && (
                    <button onClick={() => setSelected(selected?._id === alert._id ? null : alert)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700">
                      Assign
                    </button>
                  )}
                  {!['RESOLVED', 'CANCELLED'].includes(alert.status) && (
                    <>
                      <button onClick={() => handleStatus(alert._id, 'RESOLVED')}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600">
                        Resolve
                      </button>
                      <button onClick={() => handleStatus(alert._id, 'CANCELLED')}
                        className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-300">
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Assignment Panel */}
              {selected?._id === alert._id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Assign Responder</p>
                  <div className="flex gap-3">
                    <select value={assignId} onChange={e => setAssignId(e.target.value)}
                      className="input-field text-sm flex-1 py-2">
                      <option value="">Select available responder</option>
                      {responders.map(r => (
                        <option key={r._id} value={r.user?._id}>{r.user?.name} — {r.department}</option>
                      ))}
                    </select>
                    <button onClick={() => handleAssign(alert._id)} disabled={assigning}
                      className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                      {assigning ? '...' : 'Assign'}
                    </button>
                  </div>
                  {responders.length === 0 && (
                    <p className="text-xs text-orange-600 mt-2">No available responders at the moment</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn-outline text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {Math.ceil(total / 15)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 15)}
            className="btn-outline text-sm py-2 px-4 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
