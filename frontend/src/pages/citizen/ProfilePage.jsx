import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || '',
    customEmergencyMessage: user?.customEmergencyMessage || 'I need immediate help! This is an emergency.',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setAddr = (k, v) => setForm(p => ({ ...p, address: { ...p.address, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const roleColors = { citizen: 'bg-blue-600', responder: 'bg-orange-600', volunteer: 'bg-green-600', admin: 'bg-purple-600' };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="card flex items-center gap-5">
        <div className={`w-20 h-20 rounded-2xl ${roleColors[user?.role] || 'bg-blue-600'} text-white flex items-center justify-center text-3xl font-bold shadow-lg`}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-3 py-1 rounded-full text-white font-semibold ${roleColors[user?.role] || 'bg-blue-600'}`}>
              {user?.role?.toUpperCase()}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {user?.isActive ? '● Active' : '○ Inactive'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Edit Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card">
        <h2 className="font-semibold text-slate-800 text-base mb-4">Personal Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                className="input-field" placeholder="+91 98765 43210" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group</label>
            <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}
              className="input-field">
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
              <input value={form.address.city} onChange={e => setAddr('city', e.target.value)}
                className="input-field" placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
              <input value={form.address.state} onChange={e => setAddr('state', e.target.value)}
                className="input-field" placeholder="Maharashtra" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Street Address</label>
              <input value={form.address.street} onChange={e => setAddr('street', e.target.value)}
                className="input-field" placeholder="123 Main Street" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pincode</label>
              <input value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)}
                className="input-field" placeholder="400001" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Custom Emergency Message
              <span className="ml-2 text-xs font-normal text-slate-400">Sent during SOS alerts</span>
            </label>
            <textarea value={form.customEmergencyMessage} onChange={e => set('customEmergencyMessage', e.target.value)}
              className="input-field resize-none h-20" placeholder="I need immediate help!" maxLength={500} />
            <p className="text-xs text-slate-400 mt-1 text-right">{form.customEmergencyMessage.length}/500</p>
          </div>

          <button type="submit" disabled={saving}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>
      </motion.div>

      {/* Account Info */}
      <div className="card bg-slate-50">
        <h3 className="font-semibold text-slate-700 mb-3">Account Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-800">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="font-medium text-slate-800 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Member Since</span>
            <span className="font-medium text-slate-800">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
