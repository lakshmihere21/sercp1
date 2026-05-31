import { useState, useEffect } from 'react';
import { vehicleAPI, responderAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VEHICLE_ICONS = { ambulance: '🚑', police_vehicle: '🚔', fire_truck: '🚒', rescue_vehicle: '🚐' };
const STATUS_COLORS = { available: 'bg-green-100 text-green-700', dispatched: 'bg-orange-100 text-orange-700', maintenance: 'bg-yellow-100 text-yellow-700', offline: 'bg-slate-100 text-slate-500' };

export default function AdminResourcesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: '', type: 'ambulance', department: '' });
  const [savingVehicle, setSavingVehicle] = useState(false);

  const load = async () => {
    try {
      const [v, r] = await Promise.all([vehicleAPI.getAll(), responderAPI.getAll()]);
      setVehicles(v.data.data || []);
      setResponders(r.data.data || []);
    } catch { toast.error('Failed to load resources'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setSavingVehicle(true);
    try {
      await vehicleAPI.create(vehicleForm);
      toast.success('Vehicle added');
      setShowVehicleForm(false);
      setVehicleForm({ vehicleNumber: '', type: 'ambulance', department: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingVehicle(false); }
  };

  const updateVehicleStatus = async (id, status) => {
    try {
      await vehicleAPI.update(id, { status });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const availableResponders = responders.filter(r => r.availability === 'available');

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Resource Management</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ['🚑', 'Total Vehicles', vehicles.length, 'bg-blue-50'],
          ['✅', 'Available', availableVehicles.length, 'bg-green-50'],
          ['🛡️', 'Responders', responders.length, 'bg-orange-50'],
          ['🟢', 'Ready', availableResponders.length, 'bg-teal-50'],
        ].map(([icon, label, val, bg]) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center shadow-sm border border-slate-100`}>
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold text-slate-800">{val}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Vehicles Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 text-base">Emergency Vehicles</h2>
          <button onClick={() => setShowVehicleForm(!showVehicleForm)} className="btn-primary text-sm py-2 flex items-center gap-2">
            <span className="text-lg">+</span> Add Vehicle
          </button>
        </div>

        {showVehicleForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="card bg-blue-50 border-blue-100 mb-4">
            <h3 className="font-semibold text-slate-800 mb-3">Add New Vehicle</h3>
            <form onSubmit={handleAddVehicle} className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle Number *</label>
                <input required value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm(p => ({ ...p, vehicleNumber: e.target.value }))}
                  className="input-field text-sm" placeholder="MH-01-AB-1234" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Type *</label>
                <select value={vehicleForm.type} onChange={e => setVehicleForm(p => ({ ...p, type: e.target.value }))}
                  className="input-field text-sm">
                  {['ambulance', 'police_vehicle', 'fire_truck', 'rescue_vehicle'].map(t => (
                    <option key={t} value={t}>{VEHICLE_ICONS[t]} {t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                <input value={vehicleForm.department} onChange={e => setVehicleForm(p => ({ ...p, department: e.target.value }))}
                  className="input-field text-sm" placeholder="Central Hospital" />
              </div>
              <div className="sm:col-span-3 flex gap-3">
                <button type="submit" disabled={savingVehicle} className="btn-primary text-sm py-2 disabled:opacity-60">
                  {savingVehicle ? 'Adding...' : 'Add Vehicle'}
                </button>
                <button type="button" onClick={() => setShowVehicleForm(false)} className="btn-outline text-sm py-2">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <div key={v._id} className="card hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{VEHICLE_ICONS[v.type] || '🚗'}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[v.status]}`}>
                    {v.status}
                  </span>
                </div>
                <p className="font-mono font-bold text-slate-800">{v.vehicleNumber}</p>
                <p className="text-slate-500 text-sm capitalize mt-0.5">{v.type?.replace('_', ' ')}</p>
                {v.department && <p className="text-slate-400 text-xs mt-0.5">{v.department}</p>}

                <div className="flex gap-2 mt-3">
                  {v.status !== 'available' && (
                    <button onClick={() => updateVehicleStatus(v._id, 'available')}
                      className="flex-1 bg-green-50 text-green-700 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-100">
                      ✓ Mark Available
                    </button>
                  )}
                  {v.status === 'available' && (
                    <button onClick={() => updateVehicleStatus(v._id, 'maintenance')}
                      className="flex-1 bg-yellow-50 text-yellow-700 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-100">
                      🔧 Maintenance
                    </button>
                  )}
                  <button onClick={() => updateVehicleStatus(v._id, v.status === 'offline' ? 'available' : 'offline')}
                    className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-200">
                    {v.status === 'offline' ? '▶ Enable' : '⏸ Offline'}
                  </button>
                </div>
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="sm:col-span-3 text-center py-12 text-slate-400 card">
                <p className="text-3xl mb-2">🚗</p>
                <p>No vehicles registered</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responders Section */}
      <div>
        <h2 className="font-semibold text-slate-800 text-base mb-4">Responder Directory</h2>
        <div className="space-y-3">
          {responders.length === 0 ? (
            <div className="card text-center py-12 text-slate-400">
              <p className="text-3xl mb-2">🛡️</p>
              <p>No responders registered</p>
            </div>
          ) : responders.map(r => (
            <div key={r._id} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                r.availability === 'available' ? 'bg-green-500' : r.availability === 'busy' ? 'bg-orange-500' : 'bg-slate-400'
              }`}>
                {r.user?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{r.user?.name}</p>
                <p className="text-slate-500 text-xs capitalize">{r.department} · {r.badgeNumber || 'No badge'}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.skills?.slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s.replace('_', ' ')}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                  r.availability === 'available' ? 'bg-green-100 text-green-700' :
                  r.availability === 'busy' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {r.availability}
                </span>
                <p className="text-xs text-slate-400 mt-1">{r.totalResponses} responses</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
